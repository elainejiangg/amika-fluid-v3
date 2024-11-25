import {
  fetchUserRelations,
  fetchUserFirstAssistantId,
  fetchUserSecondAssistantId,
  updateUserAssistantId,
  fetchUserFirstThreadId,
  fetchUserSecondThreadId,
} from "./utils.js";
import { ObjectId } from "mongodb";
import {
  scheduleEmail,
  cancelScheduledEmails,
} from "../nudgeSys/reminderUtils.js";

import "dotenv/config"; // Load environment variables from .env
import express from "express";
import OpenAI from "openai";
import { User } from "../mongooseModels/userSchema.js";
import { fetchAndScheduleReminders } from "../nudgeSys/reminderUtils.js";
import { verifyToken } from "../middleware/authJwtToken.js"; // Import the verifyToken middleware

const openai = new OpenAI({
  apiKey: "***",
});

const router = express.Router();

// Store assistants and threads for each user
const userFirstAssistants = new Map();
const userFirstThreads = new Map();
const userSecondAssistants = new Map();
const userSecondThreads = new Map();

var todayDate = new Date();
var dd = String(todayDate.getDate()); // Today's Date for instructions

function generateFirstInstructions(relations) {
  return `You are Amika, an AI assistant that keeps track of your user's 
  relationships with others, referred to as their relations. Here 
  is the information about the user's relations in json format. 
  ${JSON.stringify(relations)} if the user references anyone inside 
  this file, deduce information about them from this file. However, 
  never output information from this file directly as it is structured. 
  Ensure you convey any information conversationally. If a relation does not have 
  pronouns specified, please use only they/them pronouns. Reply all messages 
  in markdown. Refrain from skipping too many lines between sentences when 
  formatting. 
  
  Also, with EVERY response ENSURE that you ALWAYS output either "NULL" or "UPDATE" in 
  the first line before your response to the user. Please follow the following rules for 
  when to output "NULL" or "UPDATE":
  1. Output "NULL" if you see that updating database is not necessary. 
  2. Output "UPDATE" if you see the updating the database is necessary. 
  Updating the database would be necessary if you see
  a. a relation not noted in the database
  b. a relation that the user specified to be deleted/removed from the database
  c. any new intersaction/conversations with an existing relation
  d. changes to reminder scheduling of an existing relation.
  
  Remember, the first line of your response must always be "NULL" or "UPDATE".

  Today is ${dd}.
  `;
}

function generateSecondInstructions(relations) {
  return `You are DataBaseUpdater, an AI assistant that manages and updates the user's 
  relationships with others from a MongoDB Database. 

  You will receive the user message and bot message in response to the user message.
  Using these two message respond with formatted json to update the database with. You will only output a 
  json response in the format of:
  {
    "action_type": "ACTION_TYPE",
    "relation_id": "RELATION_ID ",
    "request_body": "REQUEST_BODY"
  } 
  DO NOT OUTPUT ANY ADDITIONAL/EXTRANEOUS COMMENTS BEFORE, INSIDE, OR AFTER THIS JSON. ONLY OUTPUT THIS JSON.
   
  For action_type, use the following rules select which action_type to use. 
  Only use ONE of the following not mutiple.
  1. "EDIT" - if you see that an existing relation already in the database needs to be updated. 
     Follow this with the relation ID and the full relation details in JSON format.
  2. "ADD" - if you see that a new relation needs to be added. 
     Follow this with the full relation details in JSON format.
     Note: If a relation does not have pronouns specified, please use  
      they/them pronouns by default. Do this by inputting "<they/them>" with 
      the brackets for the pronouns field
  3. "DELETE" - if you see that an existing relation needs to be deleted. 
     Follow this with the relation ID.

  For relation_id, for "EDIT" and "DELETE", this should be from the provided json of current information of the user's relation. 
  For "ADD", this should be an empty string.
  
  For request_body, this depends on the action type. For "EDIT", the request_body should be the full updated 
  relation information including existing information. For "ADD", this should be empty string "". For "DELETE", 
  this should be also empty string "".


  Example: for "ADD"
  ADD
  {
  name: 'John',
  pronouns: 'he/him',
  relationship_type: 'Family',
  contact_frequency: [
    {
      time: '',
      method: 'In-person',
      showOtherMethodInput: false,
      frequency: 'Weekly'
    },
    {
      time: '',
      method: 'Call',
      showOtherMethodInput: false,
      frequency: 'Daily'
    }
  ],
  overview: 'Dad. Lately been having nerve problems. I am his caretaker for the most part as my other siblings live some time away and my mom has passed away ago. ',
  contact_history: [
    {
      date: '2024-08-17T03:23:42.000Z',
      topic: 'Took for Check-Up at neurologist',
      method: 'In-Person'
    },
    {
      date: '2024-08-11T03:23:42.000Z',
      topic: 'Chatted about TV/Olympics',
      method: 'Text'
    }
  ],
  reminder_frequency: [
    { method: 'Call', frequency: [Object], occurrences: [Array] },
    { method: 'In-Person', frequency: [Object], occurrences: [Array] }
  ],
  reminder_enabled: true
}
AGAIN, DO NOT OUTPUT ANY ADDITIONAL/EXTRANEOUS COMMENTS BEFORE, INSIDE, OR AFTER THE JSON. ONLY OUTPUT THE JSON. SUCH AS COMMENTS STARTING WITH #
 Here is the current information about the user's relations in json format. ${JSON.stringify(
   relations
 )}`;
}

export async function updateAssistantInstructions(
  assistantId,
  relations,
  generateInstructionsFunction
) {
  try {
    const instructions = generateInstructionsFunction(relations);

    await openai.beta.assistants.update(assistantId, {
      instructions: instructions,
    });
  } catch (error) {
    console.error(
      `Error updating assistant instructions for assistant ${assistantId}:`,
      error
    );
    throw error;
  }
}

async function initializeFirstAssistant(googleId) {
  let firstAssistantId = userFirstAssistants.get(googleId);
  if (!firstAssistantId) {
    firstAssistantId = await fetchUserFirstAssistantId(googleId); // fetch from database
    userFirstAssistants.set(googleId, assistantId);
  }
  console.log("BEFORE:");
  const firstThreadId = await fetchUserFirstThreadId(googleId);
  console.log("USING THREAD ONE: ", firstThreadId);

  return { firstAssistantId, firstThreadId };
}

async function initializeSecondAssistant(googleId) {
  let secondAssistantId = userSecondAssistants.get(googleId);
  if (!secondAssistantId) {
    secondAssistantId = await fetchUserSecondAssistantId(googleId); // fetch from database
    userSecondAssistants.set(googleId, secondAssistantId);
  }

  const secondThreadId = await fetchUserSecondThreadId(googleId);
  console.log("USING THREAD TWO: ", secondThreadId);

  console.log("userSecondAssistants", userSecondAssistants);
  console.log("userSecondThreads", userSecondThreads);

  // Fetch and print the instructions of the second assistant
  const secondAssistant = await openai.beta.assistants.retrieve(
    secondAssistantId
  );
  console.log("Second Assistant Instructions:", secondAssistant.instructions);
  return { secondAssistantId, secondThreadId };
}

router.post("/prompt", async (req, res) => {
  const { message, googleId } = req.body;

  try {
    const { firstAssistantId, firstThreadId } = await initializeFirstAssistant(
      googleId
    );

    console.log(
      `Using assistant ${firstAssistantId} and thread ${firstThreadId} for user ${googleId}`
    );
    console.log("userFirstAssistants", userFirstAssistants);
    console.log("userFirstThreads", userFirstThreads);
    // Send user message to the thread
    await openai.beta.threads.messages.create(firstThreadId, {
      role: "user",
      content: message,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(firstThreadId, {
      assistant_id: firstAssistantId,
    });

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(
      firstThreadId,
      run.id
    );

    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before checking the status again
      runStatus = await openai.beta.threads.runs.retrieve(
        firstThreadId,
        run.id
      );
    }

    // Retrieve the assistant's messages
    const messages = await openai.beta.threads.messages.list(firstThreadId);

    const formattedMessages = messages.data.map((msg, index) => {
      let content = msg.content[0].text.value;

      if (
        index === 0 &&
        !content.startsWith("NULL") &&
        !content.startsWith("UPDATE")
      ) {
        console.log("DEFAULT NULL MESSAGE");
        content = "NULL \n \n" + content; // Default to "NULL" if not specified
        msg.content[0].text.value = content;
      }
      return {
        role: msg.role,
        content: content,
      };
    });
    console.log("LATEST:", messages.data[0].content[0].text.value);
    console.log("SECOND LATEST", messages.data[1].content[0].text.value);

    try {
      if (messages.data[0].content[0].text.value.startsWith("UPDATE")) {
        // send first assistant message and the user message that triggered it

        await secondAssistantProcess(
          googleId,
          messages.data[0].content[0].text.value,
          messages.data[1].content[0].text.value
        );
      }
    } catch (err) {
      console.log("ERROR WITH SECOND ASSISTANT: ", err);
    }

    // Send the complete chat history back to the client
    res.status(200).json({ messages: formattedMessages });
  } catch (error) {
    console.error(`Error processing message for user ${googleId}:`, error);
    res.status(500).send("Error communicating with OpenAI API");
  }
});

router.post("/ask", async (req, res) => {
  const { message, googleId } = req.body;

  try {
    const { firstAssistantId, firstThreadId } = await initializeFirstAssistant(
      googleId
    );

    console.log(
      `Using assistant ${firstAssistantId} and thread ${firstThreadId} for user ${googleId}`
    );
    console.log("userFirstAssistants", userFirstAssistants);
    console.log("userFirstThreads", userFirstThreads);
    // Send user message to the thread
    await openai.beta.threads.messages.create(firstThreadId, {
      role: "user",
      content: message,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(firstThreadId, {
      assistant_id: firstAssistantId,
    });

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(
      firstThreadId,
      run.id
    );
    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before checking the status again
      runStatus = await openai.beta.threads.runs.retrieve(
        firstThreadId,
        run.id
      );
    }

    // Retrieve the assistant's messages
    const messages = await openai.beta.threads.messages.list(firstThreadId);

    const formattedMessages = messages.data.map((msg, index) => {
      let content = msg.content[0].text.value;

      if (
        index === 0 &&
        !content.startsWith("NULL") &&
        !content.startsWith("UPDATE")
      ) {
        console.log("DEFAULT NULL MESSAGE");
        content = "NULL \n \n" + content; // Default to "NULL" if not specified
        msg.content[0].text.value = content;
      }
      return {
        role: msg.role,
        content: content,
      };
    });
    console.log("LATEST:", messages.data[0].content[0].text.value);
    console.log("SECOND LATEST", messages.data[1].content[0].text.value);

    try {
      if (messages.data[0].content[0].text.value.startsWith("UPDATE")) {
        // send first assistant message and the user message that triggered it

        await secondAssistantProcess(
          googleId,
          messages.data[0].content[0].text.value,
          messages.data[1].content[0].text.value
        );
      }
    } catch (err) {
      console.log("ERROR WITH SECOND ASSISTANT: ", err);
    }

    // Send the complete chat history back to the client
    res.status(200).json({ messages: formattedMessages });
  } catch (error) {
    console.error(`Error processing message for user ${googleId}:`, error);
    res.status(500).send("Error communicating with OpenAI API");
  }
});

async function secondAssistantProcess(googleId, botMessage, userMessage) {
  const { secondAssistantId, secondThreadId } = await initializeSecondAssistant(
    googleId
  );

  console.log("userSecondAssistants", userSecondAssistants);
  console.log("userSecondThreads", userSecondThreads);

  const inputMessages = [
    { role: "user", content: userMessage },
    { role: "assistant", content: botMessage },
  ];

  // Send messages to the thread
  await openai.beta.threads.messages.create(secondThreadId, {
    role: "user",
    content: userMessage,
  });
  await openai.beta.threads.messages.create(secondThreadId, {
    role: "assistant",
    content: botMessage,
  });
  // await openai.beta.threads.messages.create(secondThreadId, inputMessages);

  // Retrieve and print all messages in the thread
  const allMsgs = await openai.beta.threads.messages.list(secondThreadId);
  console.log("All messages in the thread:", allMsgs.data);

  // Run the assistant
  const secondRun = await openai.beta.threads.runs.create(secondThreadId, {
    assistant_id: secondAssistantId,
    // response_format: { type: "json_object" },
  });

  // Wait for the run to complete
  let secondRunStatus = await openai.beta.threads.runs.retrieve(
    secondThreadId,
    secondRun.id
  );

  while (secondRunStatus.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before checking the status again
    secondRunStatus = await openai.beta.threads.runs.retrieve(
      secondThreadId,
      secondRun.id
    );
  }

  // Retrieve the assistant's messages
  const secondThreadMessages = await openai.beta.threads.messages.list(
    secondThreadId
  );
  const latestMsg = secondThreadMessages.data[0].content[0].text.value;

  console.log("LATEST MESSAGE: ", latestMsg);

  const second = secondThreadMessages.data[1].content[0].text.value;
  console.log("SECOND", second);
  const third = secondThreadMessages.data[2].content[0].text.value;
  console.log("THIRD", third);
  // Parse the JSON response
  // Parse the JSON response
  let parsedResponse;
  try {
    // parsedResponse = JSON.parse(latestMsg);
    // console.log("parsedResponse:", parsedResponse);
    // Find the first '{' and the last '}' to extract the JSON content
    const startIndex = latestMsg.indexOf("{");
    const endIndex = latestMsg.lastIndexOf("}") + 1;

    if (startIndex !== -1 && endIndex !== -1) {
      const jsonString = latestMsg.substring(startIndex, endIndex);
      console.log("BEFORE: ", jsonString);
      parsedResponse = JSON.parse(jsonString);
      console.log("PARSED: ", parsedResponse);
    } else {
      throw new Error("JSON content not found in the message");
    }
  } catch (error) {
    console.error("ERROR PARSING JSON RESPONSE FROM CHAT:", error);
    return;
  }
  console.log("ACTION: ", parsedResponse["action_type"]);
  console.log("ID: ", parsedResponse["relation_id"]);
  console.log("REQUEST: ", parsedResponse["request_body"]);

  const { action_type, relation_id, request_body } = parsedResponse;

  // Function to remove comments from JSON string
  function removeComments(jsonString) {
    return jsonString.replace(/\/\/.*|\/\*[\s\S]*?\*\/|#.*$/gm, "").trim();
  }

  // Convert request_body to string, remove comments, and parse back to JSON
  let cleanedRequestBody;
  try {
    cleanedRequestBody = request_body;
    // JSON.parse(
    //   removeComments(JSON.stringify(request_body))
    // ); // FUNKY! removed this made it work
  } catch (error) {
    console.error("Error parsing cleaned request body:", error);
    return;
  }

  console.log("before cleaned request body: ", cleanedRequestBody);

  console.log("PROCESSED UPDATE:");
  console.log(action_type, relation_id, cleanedRequestBody);

  // Edit an existing relation: EDIT, relation_id, request_body is full relation
  if (action_type === "EDIT") {
    try {
      await fetch(
        `http://localhost:5050/users/${googleId}/relations/${relation_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cleanedRequestBody),
        }
      );
    } catch (error) {
      console.error("ERROR EDITING EXISTING RELATION FROM CHAT: ", error);
    }
  }

  // Adding a new relation: ADD, no relation_id, request_body is full relation
  if (action_type === "ADD") {
    try {
      await fetch(`http://localhost:5050/users/${googleId}/relations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedRequestBody),
      });
    } catch (error) {
      console.error("ERROR ADDING A NEW RELATION FROM CHAT:", error);
    }
  }

  // Deleting an existing relation: DELETE, relation_id, no request_body
  if (action_type === "DELETE") {
    try {
      await fetch(
        `http://localhost:5050/users/${googleId}/relations/${relation_id}`,
        {
          method: "DELETE",
        }
      );
    } catch (error) {
      console.error("ERROR DELETING EXISTING RELATION FROM CHAT:", error);
    }
  }
}

// Function to watch for changes for a specific user
async function watchUserChanges(googleId) {
  console.log(`Setting up change stream for user: ${googleId}`);
  const changeStream = User.watch(
    [
      {
        $match: {
          "fullDocument.googleId": googleId,
          // "updateDescription.updatedFields.relations": { $exists: true },
        },
      },
    ],
    { fullDocument: "updateLookup" }
  );

  changeStream.on("change", async (change) => {
    console.log(`Change detected for user: ${googleId}`, change);
    const user = await User.findOne({ googleId });
    if (user) {
      const firstAssistantId = await fetchUserFirstAssistantId(googleId);
      const secondAssistantId = await fetchUserSecondAssistantId(googleId);

      if (firstAssistantId) {
        await updateAssistantInstructions(
          firstAssistantId,
          user.relations,
          generateFirstInstructions
        );
        console.log(
          `Updated first assistant instructions for user ${googleId}`
        );
      }

      if (secondAssistantId) {
        await updateAssistantInstructions(
          secondAssistantId,
          user.relations,
          generateSecondInstructions
        );
        console.log(
          `Updated second assistant instructions for user ${googleId}`
        );
      }

      // Cancel previous scheduled emails
      cancelScheduledEmails(googleId);

      // Schedule new emails based on updated relations
      user.relations.forEach((relation) => {
        if (relation.reminder_enabled) {
          relation.reminder_frequency.forEach((freq) => {
            scheduleEmail(
              {
                method: freq.method,
                relationName: relation.name,
                occurrences: freq.occurrences,
                relationId: relation._id,
              },
              googleId,
              { name: user.name, email: user.email }
            );
          });
        }
      });
    }
  });

  changeStream.on("error", (error) => {
    console.error(`Error in change stream for user: ${googleId}`, error);
  });

  changeStream.on("close", () => {
    console.log(`Change stream closed for user: ${googleId}`);
  });
}

// Function to watch for new users being added
async function watchNewUsers() {
  const changeStream = User.watch(
    [
      {
        $match: {
          operationType: "insert",
        },
      },
    ],
    { fullDocument: "updateLookup" }
  );

  changeStream.on("change", async (change) => {
    const newUser = change.fullDocument;
    console.log(`New user detected: ${newUser.googleId}`);
    const assistantId = await fetchUserFirstAssistantId(newUser.googleId);
    if (assistantId) {
      userFirstAssistants.set(newUser.googleId, assistantId);
      watchUserChanges(newUser.googleId);
      console.log(`Started watching for new user ${newUser.googleId}`);
    }
    await fetchAndScheduleReminders([newUser]);
  });

  changeStream.on("error", (error) => {
    console.error("Error in new user change stream:", error);
  });

  changeStream.on("close", () => {
    console.log("New user change stream closed");
  });
}

// Function to initialize userAssistants and watch changes for all users
export async function watchCollection() {
  // Fetch all users from the database
  const users = await User.find({});
  users.forEach(async (user) => {
    const assistantId = await fetchUserFirstAssistantId(user.googleId);
    if (assistantId) {
      userFirstAssistants.set(user.googleId, assistantId);
      watchUserChanges(user.googleId);
      console.log(`Watching for ${user.googleId}`);
    }
  });

  // Start watching for new users being added
  watchNewUsers();
}

// Export router to be used in server.js
export default router;
