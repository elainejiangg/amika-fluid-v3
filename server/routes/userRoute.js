import express from "express";
import { User } from "../mongooseModels/userSchema.js"; // import schemas ( & subschemas)
import { sendEmail } from "../nudgeSys/emailService.js";
import { fetchAndScheduleReminders } from "../nudgeSys/reminderUtils.js";
import { OpenAI } from "openai";
import { verifyToken } from "../middleware/authJwtToken.js"; // Import the verifyToken middleware

const router = express.Router();
const openai = new OpenAI({
  apiKey: "***",
});

///////////////////// ENDPOINTS /////////////////////
// Add the verify-token endpoint
router.post("/auth/verify-token", verifyToken, (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Token is valid", user: req.user });
});

// CHECK IF USER IS NEW [ /users/:googleId/isNew ]
router.get("/users/:googleId/isNew", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (user) {
      return res.status(200).json({ isNew: false });
    } else {
      return res.status(200).json({ isNew: true });
    }
  } catch (err) {
    res.status(500).send("ERROR CHECKING USER STATUS");
  }
});

// CREATE SINGLE USER [ /users ]
router.post("/users", async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ googleId: req.body.googleId });
    if (existingUser) {
      return res.status(204).send("USER ALREADY EXISTS");
    }

    const first_assistant = await openai.beta.assistants.create({
      name: "Amika",
      instructions: `You are Amika, an AI assistant that keeps track of your user's 
      relationships with others, referred to as their relations. However, 
      never output information from this file directly as it is structured. 
      Ensure you convey any information conversationally. Reply all messages 
      in markdown. Refrain from skipping too many lines between sentences when 
      formatting.`,
      tools: [{ type: "code_interpreter" }],
      model: "gpt-4o",
    });
    const first_newAssistantId = first_assistant.id;
    // const first_thread = await openai.beta.threads.create();
    // const first_newThreadId = first_thread.id;

    const second_assistant = await openai.beta.assistants.create({
      name: "DatabaseUpdater",
      instructions: `You are DataBaseUpdater, an AI assistant that manages and updates the user's 
      relationships with others, referred to as their relations. 

      You will receive the user message and bot message in response to the user message.
      Using these two messages, create a response that includes the necessary action.

      Also, with EVERY response ENSURE that you ALWAYS output one of the following 
      action types in the first line before your response to the user:
      1. "EDIT" - if you see that an existing relation needs to be updated. 
         Follow this with the relation ID and the full relation details in JSON format.
      2. "ADD" - if you see that a new relation needs to be added. 
         Follow this with the full relation details in JSON format.
         Note: If a relation does not have pronouns specified, please use  
          they/them pronouns by default. Do this by inputting "<they/them>" with 
          the brackets for the pronouns field
      3. "DELETE" - if you see that an existing relation needs to be deleted. 
         Follow this with the relation ID.

      The format of your response should be in json format:
      {
        "action_type": "ACTION_TYPE",
        "relation_id": "RELATION_ID (if applicable)",
        "request_body": "REQUEST_BODY (if applicable)"
      }

      Note: 
      - relation_id should be from the provided json of current information of the user's relation.
      - request_body depends on the action type. For "EDIT", the request_body should be the full updated 
      relation information including existing information. For "ADD", this should be empty. For "DELETE", 
      this should be also empty.`,
      tools: [{ type: "code_interpreter" }],
      model: "gpt-4o",
    });
    const second_newAssistantId = second_assistant.id;
    // const second_thread = await openai.beta.threads.create();
    // const second_newThreadId = second_thread.id;

    const newUserData = {
      googleId: req.body.googleId,
      email: req.body.email,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      pronouns: req.body.pronouns,
      picture: req.body.picture,
      interests: req.body.interests,
      first_assistant_id: first_newAssistantId,
      first_thread_ids: [],
      second_assistant_id: second_newAssistantId,
      second_thread_ids: [],
    };

    const newUser = new User(newUserData);

    await newUser.save();
    res.status(204).send();
  } catch (err) {
    res.status(500).send("ERROR CREATING USER");
  }
});

// UPDATE SINGLE USER [ /users/:id ]
router.patch("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedData = req.body;

    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    // Update the user with the new data
    Object.assign(user, updatedData);

    await user.save();

    res.status(204).send();
  } catch (err) {
    res.status(500).send("ERROR UPDATING USER");
  }
});

// UPDATE USER EMAIL [ /users/:googleId/email ]
router.patch("/users/:googleId/email", async (req, res) => {
  try {
    const { googleId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ googleId });

    if (!user) {
      return res.status(404).json({ error: "USER NOT FOUND" });
    }

    user.email = email;
    await user.save();

    res
      .status(200)
      .json({ message: "Email updated successfully", email: user.email });
  } catch (err) {
    console.error("Error updating user email:", err);
    res.status(500).json({
      error: "ERROR UPDATING USER EMAIL",
      details: err.message,
    });
  }
});

// GET USER INFO [ /users/:googleId/info ]
router.get("/users/:googleId/info", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    const userInfo = {
      first_name: user.first_name,
      last_name: user.last_name,
      pronouns: user.pronouns,
      email: user.email,
      assistant_id: user.assistant_id,
      picture: user.picture,
      interests: user.interests,
    };
    console.log("USER INFO", userInfo);

    res.status(200).send(userInfo);
  } catch (err) {
    res.status(500).send("ERROR GETTING USER INFO");
  }
});

// UPDATE USER INFO [ /users/:googleId/info ]
router.patch("/users/:googleId/info", async (req, res) => {
  try {
    const { googleId } = req.params;
    const updatedData = req.body;

    const user = await User.findOne({ googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    // Update the user with the new data
    Object.assign(user, updatedData);

    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).send("ERROR UPDATING USER INFO");
  }
});

// GET USER FIRST ASSISTANT ID [ /users/:googleId/first_assistant_id ]
router.get("/users/:googleId/first_assistant_id", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    const assistantId = user.first_assistant_id;
    res.status(200).send(assistantId);
  } catch (err) {
    res.status(500).send("ERROR GETTING USER ASSISTANT ID");
  }
});

// GET USER SECOND ASSISTANT ID [ /users/:googleId/second_assistant_id ]
router.get("/users/:googleId/second_assistant_id", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    const assistantId = user.second_assistant_id;
    res.status(200).send(assistantId);
  } catch (err) {
    res.status(500).send("ERROR GETTING USER ASSISTANT ID");
  }
});

// UPDATE USER ASSISTANT ID [ /users/:googleId/assistant_id ]
// router.patch("/users/:googleId/:assistant_id", async (req, res) => {
//   try {
//     const user = await User.findOne({ googleId: req.params.googleId });
//     if (!user) return res.status(404).send("USER NOT FOUND");

//     user.assistant_id = req.params.assistant_id;
//     await user.save();
//     res.status(200).send();
//   } catch (err) {
//     res.status(500).send("ERROR UPDATING USER ASSISTANT ID");
//   }
// });

// GENERATE NEW USER THREAD IDS [ /users/:googleId/thread_ids ]
router.post("/users/:googleId/thread_ids", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    // Create a new thread using OpenAI API
    const first_thread = await openai.beta.threads.create();
    user.first_thread_ids.push(first_thread.id);

    const second_thread = await openai.beta.threads.create();
    user.second_thread_ids.push(second_thread.id);

    await user.save();
    res.status(200).send();
  } catch (err) {
    res.status(500).send("ERROR UPDATING USER THREAD ID");
  }
});

// GENERATE NEW USER SECOND THREAD ID & UPDATE USER SECOND THREAD IDS [ /users/:googleId/second_thread_id ]
// router.post("/users/:googleId/second_thread_id", async (req, res) => {
//   try {
//     const user = await User.findOne({ googleId: req.params.googleId });
//     consol;
//     if (!user) return res.status(404).send("USER NOT FOUND");

//     // Create a new thread using OpenAI API

//     await user.save();
//     res.status(200).send();
//   } catch (err) {
//     res.status(500).send("ERROR UPDATING USER THREAD ID");
//   }
// });

// GET MOST RECENT USER FIRST THREAD ID [ /users/:googleId/first_thread_id ]
router.get("/users/:googleId/first_thread_id", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    // Check if the first_thread_ids array is not empty
    if (user.first_thread_ids.length === 0) {
      return res.status(404).send("NO THREADS FOUND");
    }

    // Get the most recent thread ID (last item in the array)
    const mostRecentThreadId =
      user.first_thread_ids[user.first_thread_ids.length - 1];
    res.status(200).send(mostRecentThreadId);
  } catch (err) {
    console.error("Error getting most recent first thread ID:", err);
    res.status(500).send("ERROR GETTING MOST RECENT FIRST THREAD ID");
  }
});

// GET MOST RECENT USER SECOND THREAD ID [ /users/:googleId/first_thread_id ]
router.get("/users/:googleId/second_thread_id", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    // Check if the first_thread_ids array is not empty
    if (user.second_thread_ids.length === 0) {
      return res.status(404).send("NO THREADS FOUND");
    }

    // Get the most recent thread ID (last item in the array)
    const mostRecentThreadId =
      user.second_thread_ids[user.second_thread_ids.length - 1];
    res.status(200).send(mostRecentThreadId);
  } catch (err) {
    console.error("Error getting most recent first thread ID:", err);
    res.status(500).send("ERROR GETTING MOST RECENT FIRST THREAD ID");
  }
});

// GET USER FIRST THREAD ID [ /users/:googleId/thread_id ]
// router.get("/users/:googleId/first_thread_id", async (req, res) => {
//   try {
//     const user = await User.findOne({ googleId: req.params.googleId });
//     if (!user) return res.status(404).send("USER NOT FOUND");

//     const threadId = user.first_thread_id;
//     res.status(200).send(threadId);
//   } catch (err) {
//     res.status(500).send("ERROR UPDATING USER THREAD ID");
//   }
// });

// GET ALL RELATIONS of a user [ /<googleId>/relations ]
router.get("/users/:googleId/relations", async (req, res) => {
  try {
    let user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    let relations = user.relations;
    res.status(200).send(relations);
  } catch (err) {
    res.status(500).send("ERROR GETTING RELATIONS!");
  }
});

// GET SINGLE RELATION of a user by relation _id [ /<googleId>/relations/<id> ]
router.get("/users/:googleId/relations/:id", async (req, res) => {
  try {
    let user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    let relation = user.relations.id(req.params.id);
    if (!relation) return res.status(404).send("RELATION NOT FOUND");
    console.log(relation);
    res.status(200).send(relation);
  } catch (err) {
    res.status(500).send("ERROR GETTING RELATION!");
  }
});

// CREATE A SINGLE RELATION of a user [ /users/<googleId>/relations ]
router.post("/users/:googleId/relations", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    const newRelation = {
      name: req.body.name,
      picture: req.body.picture,
      pronouns: req.body.pronouns,

      relationship_type: req.body.relationship_type,
      contact_frequency: req.body.contact_frequency,
      overview: req.body.overview,
      contact_history: req.body.contact_history,
      reminder_frequency: req.body.reminder_frequency,
      reminder_enabled: req.body.reminder_enabled,
      reminder_occurences: req.body.reminder_occurences,
    };
    console.log("REQUEST BODY: ");
    console.log(req.body);

    user.relations.push(newRelation);
    await user.save();

    res.status(204).send();
  } catch (err) {
    res.status(500).send("ERROR CREATING RELATION");
  }
});

//UPDATE SINGLE RELATION of a user [ /users/:googleId/relations/:id ]
router.patch("/users/:googleId/relations/:id", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) return res.status(404).send("USER NOT FOUND");

    const relation = user.relations.id(req.params.id);
    if (!relation) return res.status(404).send("RELATION NOT FOUND");

    Object.assign(relation, req.body);

    await user.save();
    res.status(204).send();
  } catch (err) {
    res.status(500).send("ERROR UPDATING RELATION");
  }
});

// DELETE SINGLE RELATION of a user [ /users/:googleId/relations/:id ]
router.delete("/users/:googleId/relations/:id", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    if (!user) {
      console.log("USER NOT FOUND");
      return res.status(404).json({ error: "USER NOT FOUND" });
    }
    const relationIndex = user.relations.findIndex(
      (relation) => relation._id.toString() === req.params.id
    );
    if (relationIndex === -1) {
      console.log("RELATION NOT FOUND");
      return res.status(404).json({ error: "RELATION NOT FOUND" });
    }
    user.relations.splice(relationIndex, 1);

    await user.save();

    console.log("Relation deleted successfully");
    res.status(200).json({ message: "Relation deleted successfully" });
  } catch (err) {
    console.error("Error deleting relation:", err);
    res.status(500).json({
      error: "ERROR DELETING RELATION",
      details: err.message,
      stack: err.stack,
    });
  }
});

//GET all reminder enabled relations of user
router.get("/users/:googleId/reminders", async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });
    const relations = user.relations.filter(
      (relation) => relation.reminder_enabled
    );
    // const occurrences = relations.map(
    //   (relation) => relation.reminder_frequency
    // );
    res.status(200).send(relations);
  } catch (err) {
    res.status(500).send("ERROR GETTING OCCURRENCES");
  }
});

// router.post("/send-test-email", async (req, res) => {
//   try {
//     const { to, subject, text } = req.body;
//     await sendEmail(to, subject, text);
//     res.status(200).send("Email sent successfully");
//   } catch (err) {
//     res.status(500).send("ERROR SENDING EMAIL");
//   }
// });

// // GET ALL RELATIONS of a user [ /<googleId>/relations ]
// router.get("/users/:googleId/relations", async (req, res) => {
//   try {
//     let user = await User.findOne({ googleId: req.params.googleId });
//     if (!user) return res.status(404).send("USER NOT FOUND");

//     let relations = user.relations;
//     res.status(200).send(relations);
//   } catch (err) {
//     res.status(500).send("ERROR GETTING RELATIONS!");
//   }
// });

// LOGIN USER [ /login ]
// router.post("/login", async (req, res) => {
//   try {
//     const { googleId } = req.body;
//     const user = await User.findOne({ googleId });
//     if (!user) {
//       return res.status(404).send("USER NOT FOUND");
//     }
//     console.log(googleId);
//     // Fetch and schedule reminders after login
//     // await fetchAndScheduleReminders(googleId);
//     console.log("Successfully  fetch and schedule!");
//     res.status(200).send("User logged in and reminders scheduled");
//   } catch (err) {
//     res.status(500).send("ERROR LOGGING IN USER");
//   }
// });

export default router;
