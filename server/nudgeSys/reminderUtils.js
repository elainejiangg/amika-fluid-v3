// This module provides functionality for scheduling email reminders based on user relations.
// It utilizes OpenAI's GPT model to generate email content dynamically.
import { sendEmail } from "./emailService.js";
import { User } from "../mongooseModels/userSchema.js";
import cron from "node-cron";
import fetch from "node-fetch";
import { generateToken } from "../middleware/jwtUtils.js";

const OPENAI_API_KEY = "***"; // REPLACE WITH YOUR OPENAI API KEY
const GPT_PROMPT = `Write in HTML but do not include !DOCTYPE html, html, and body tags (just jump straight into <p> tags). You will generate a 20 - 50 word email body (please ONLY write an addressing start, and an email body, no subject title)
  that asks the recipent if they have contacted the user via a certain method of contact. Mention that if they have not contacted the person 
  suggest to the recipient topics of conversation to talk about between the recipient and their 
  specified relation. Include the method of contact that the recipient should reach out to the relation.  
  Please use any of the following information about their relation to generate this email and information 
  of the recipent to address the email to. Don't sign off with anything. The second will be something like "No, I have not met have the relation but I would like assistance". 
  Keep a encouraging, casual tone.`;
const scheduledJobs = new Map(); // Store scheduled jobs

async function getGptRecommendation(relationInfo) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4", // Specify the model you want to use
      messages: [
        { role: "system", content: GPT_PROMPT },
        { role: "user", content: relationInfo },
      ],
      max_tokens: 100, // Limit the response length
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content; // Return the generated content
}

// Function to schedule an email reminder
export async function scheduleEmail(reminder, googleId, userInfo) {
  const { method, relationName, occurrences, relationId } = reminder;
  occurrences.forEach((occurrence) => {
    const date = new Date(occurrence);
    const cronTime = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${
      date.getMonth() + 1
    } *`;

    console.log(
      `Scheduling email for ${relationName} at ${date.toString()} using ${method}`
    );

    const job = cron.schedule(cronTime, async () => {
      // Fetch relation information from the server
      const relationResponse = await fetch(
        `http://localhost:5050/users/${googleId}/relations/${relationId}`
      );
      if (!relationResponse.ok) {
        console.error("Failed to fetch relation information");
        return;
      }
      const relationInfo = await relationResponse.json();
      const filterRelationInfo = {
        relationName: relationName,
        methodOfContact: method,
        pronouns: relationInfo.pronouns,
        relationType: relationInfo.relation_type,
        overviewOfPerson: relationInfo.overview,
        contactHistory: relationInfo.contact_history,
        contactFrequency: relationInfo.contact_frequency,
        userName: userInfo.name,
      };
      const emailBody = await getGptRecommendation(
        JSON.stringify(filterRelationInfo)
      );

      // Generate a token for the user
      const token_chatted = generateToken(
        {
          googleId: googleId,
          email: userInfo.email,
        },
        emailBody +
          ` Answer: Yes, I have chatted with ${relationName} and would like to talk more about it`
      );

      const token_notChatted = generateToken(
        {
          googleId: googleId,
          email: userInfo.email,
        },
        emailBody +
          ` Answer: No, I have not chatted with ${relationName} and would like assistance such as suggestions of what to talk about`
      );
      const chatLink_chatted = `http://localhost:5173/?token=${token_chatted}`;
      const chatLink_notChatted = `http://localhost:5173/?token=${token_notChatted}`;
      console.log("EMAIL BODY", emailBody);

      // Construct the email content with in-app links, letting users be automatically signed in if they click on the links
      const emailContent = `
      ${emailBody}
      <style>
        .chat-link {
          padding: 5px;
          text-decoration: none;
          font-weight: bold;
          border-radius: 10px;
          display: inline-block;
        }
        .chat-link-chatted {
          background-color: #edf3ff;
          color: #2d60cf;
        }
        .chat-link-chatted:hover {
          background-color: #b0c4de;
          color: #1e3a8a;
        }
        .chat-link-not-chatted {
          background-color: #f0edff;
          color: #5441c4;
        }
        .chat-link-not-chatted:hover {
          background-color: #c0b6ff;
          color: #3b2a8a;
        }
      </style>
      <a href="${chatLink_chatted}" class="chat-link chat-link-chatted">Yes, I have spoken to them; let's chat!</a> 
      <a href="${chatLink_notChatted}" class="chat-link chat-link-not-chatted">No, I have not spoken to them, but I'd like some assistance!</a>`;
      console.log(
        `Sending email for ${relationName} at ${new Date().toString()} for ${method}`
      );

      // Send the email using the sendEmail function
      await sendEmail(
        userInfo.email,
        `Reminder to Connect with ${relationName}! `,
        emailContent,
        { isHtml: true } // Assuming sendEmail function accepts an options parameter to specify content type
      );
    });

    // Store the job in the map
    if (!scheduledJobs.has(googleId)) {
      scheduledJobs.set(googleId, []);
    }
    scheduledJobs.get(googleId).push(job);
  });
}

// Function to fetch users and schedule their reminders
export async function fetchAndScheduleReminders() {
  try {
    const users = await User.find({});
    for (const user of users) {
      const googleId = user.googleId;
      const userInfo = {
        name: user.name,
        email: user.email,
      };

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
              userInfo
            );
          });
        }
      });
    }
    console.log("Successful fetch and schedule for all users");
  } catch (error) {
    console.error("Error fetching and scheduling reminders:", error);
  }
}

// Function to cancel scheduled emails for a user
export function cancelScheduledEmails(googleId) {
  const jobs = scheduledJobs.get(googleId);
  if (jobs) {
    jobs.forEach((job) => job.stop()); // Stop each scheduled job
    scheduledJobs.delete(googleId); // Remove the user from the scheduled jobs map
    console.log(`Cancelled all scheduled emails for user ${googleId}`);
  }
}
