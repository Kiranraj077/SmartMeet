<!--
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


## AI Agents for Generating Meet Summaries, & Composing and Sending Emails

The agent files can be found in [server](https://github.com/Kiranraj077/SmartMeet/tree/master/server)
- Takes a transcript (hardcoded sample or can be extended for `.txt`/`.json` inputs)
- Extracts a **summary** and identifies **participant-specific action items**
- Composes **personalized follow-up emails**
- Optionally sends those emails via SMTP (configurable)

The AI Agent is based on [Ollama](https://ollama.com/), [CrewAI](https://github.com/joaomdmoura/crewai), [Python](https://www.python.org/), [Lanchain-Ollama](https://python.langchain.com/docs/integrations/llms/ollama/)



This project uses `crewai==0.130.0`, which **does not support YAML config files** or the `crewai create` CLI. If you try to use [agents.yaml](https://github.com/Kiranraj077/SmartMeet/blob/master/server/meeting_automation/src/meeting_automation/config/agents.yaml) and [tasks.yaml](https://github.com/Kiranraj077/SmartMeet/blob/master/server/meeting_automation/src/meeting_automation/config/tasks.yaml), you will face errors.Those features are only available in unreleased development branches, not on PyPI. For this reason, the agent is fully implemented in Python code via [main.py](https://github.com/Kiranraj077/SmartMeet/blob/master/server/meeting_automation/src/meeting_automation/main.py)
-->
# SmartMeet AI

A full-stack, AI-powered application designed to streamline post-meeting workflows by automating summarization, task extraction, and personalized email delivery.

---

## Overview

SmartMeet AI is a "real-world product" built to solve the common problem of inefficient meeting follow-ups. By leveraging a multi-agent AI pipeline, the application automatically processes meeting transcripts to generate concise summaries, identify action items, and deliver them directly to relevant team members via email.
The entire system is powered by a robust backend and an intuitive user experience. The project demonstrates proficiency in building and orchestrating complex systems and a strong understanding of full-stack development.

---
## Features
- Automated Summarization: Utilizes an AI agent to generate a concise summary of the meeting transcript.

- Persona-Specific Task Extraction: Employs an AI agent to extract and assign action items tailored to specific individuals mentioned in the meeting.

- Automated Email Delivery: Integrates with SMTP to automatically send personalized follow-up emails with the meeting summary and assigned tasks.

- Full-Stack Application: Developed on the MERN stack (MongoDB, Express.js, React, Node.js), providing a scalable and responsive platform.

- Chrome Extension Integration: Seamlessly captures meeting transcripts via a custom Chrome extension, initiating the entire automated workflow.

- API-Driven Workflow: The backend exposes a series of REST APIs for summarization and task extraction, enabling a modular and scalable architecture.

---

## Technology Stack
- Frontend: React, JavaScript

- Backend: Node.js, Express.js, Flask (for API)

- Database: MongoDB

- AI Models: LLaMa 3 (via Ollama), custom AI agents

- Tools: Chrome Extension API, SMTP, Git

---

## Architecture
The system is designed with a multi-layered architecture:

- Transcription: A custom Chrome extension captures the meeting transcript.

- API Ingestion: The transcript is sent to the backend APIs.

- AI Pipeline: The backend orchestrates a multi-agent pipeline:

- One agent processes the transcript to create a summary.

- Another agent extracts persona-specific tasks.

- Data Storage: The summarized data and tasks are stored in a MongoDB database.

- Email Delivery: The system uses SMTP to generate and deliver personalized follow-up emails to the relevant recipients.
