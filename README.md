# Gyan --- A Multilingual Learning App for Children with Dyslexia

> **Gyan** is a game-based mobile learning application designed to
> support children aged 6--10 who experience dyslexia-related reading
> and literacy challenges. It aims to make practice more accessible
> through interactive learning activities, speech input/output, progress
> tracking, and rewards in **English, Hindi, and Marathi**.

**Project type:** Academic / team project\
**Platform:** Android-focused mobile app (React Native + Expo)\
**Repository:** `parthmandore/Gyan`\
**Status:** In development --- core backend and mobile app are being
integrated; verify each feature on the target device before describing
it as production-ready.

------------------------------------------------------------------------

## Table of Contents

-   [Problem Statement](#problem-statement)
-   [Objectives](#objectives)
-   [Key Features](#key-features)
-   [Technology Stack](#technology-stack)
-   [System Architecture](#system-architecture)
-   [Supported Languages](#supported-languages)
-   [Project Structure](#project-structure)
-   [Prerequisites](#prerequisites)
-   [Installation and Setup](#installation-and-setup)
    -   [1. Clone the Repository](#1-clone-the-repository)
    -   [2. Configure the Backend](#2-configure-the-backend)
    -   [3. Configure the Mobile App](#3-configure-the-mobile-app)
    -   [4. Configure the AI Speech
        Service](#4-configure-the-ai-speech-service)
    -   [5. Run the Application](#5-run-the-application)
-   [Environment Variables](#environment-variables)
-   [Backend API Overview](#backend-api-overview)
-   [AI Speech Service](#ai-speech-service)
-   [Database and Data Models](#database-and-data-models)
-   [Learning Activities](#learning-activities)
-   [Parent and Teacher Dashboards](#parent-and-teacher-dashboards)
-   [Dataset Information](#dataset-information)
-   [Testing](#testing)
-   [Troubleshooting](#troubleshooting)
-   [Security and Privacy](#security-and-privacy)
-   [Current Development Notes](#current-development-notes)
-   [Future Scope](#future-scope)
-   [Team Workflow](#team-workflow)
-   [Contributing](#contributing)
-   [Disclaimer](#disclaimer)
-   [License](#license)

------------------------------------------------------------------------

## Problem Statement

Children with dyslexia may find reading, letter recognition, spelling,
and written-language tasks difficult. Conventional practice materials
may not always provide interactive, multisensory, or
language-appropriate support. The goal of Gyan is to provide a
child-friendly learning environment that combines short activities with
speech-based interaction and progress feedback.

Gyan is an educational support tool. It is not intended to diagnose
dyslexia or replace assessment, therapy, or guidance from qualified
educators and healthcare professionals.

## Objectives

1.  Provide accessible literacy practice for children aged 6--10.
2.  Support English, Hindi, and Marathi learning content.
3.  Use interactive games to practise letter recognition and related
    skills.
4.  Explore speech-to-text (STT) and text-to-speech (TTS) to support
    spoken interaction.
5.  Track learning activity and progress over time.
6.  Provide parent and teacher views of linked learners' progress.
7.  Encourage continued practice through achievements and rewards.
8.  Keep the mobile interface connected to a central backend and
    database.

## Key Features

The following describes the intended feature set. Availability may vary
while integration and testing are in progress.

-   **Multilingual learning:** English, Hindi, and Marathi.
-   **Interactive learning games:** alphabet matching,
    capital/small-letter matching, vowel--matra matching, and
    speech/word challenges.
-   **Speech support:** planned/integrated service boundary for speech
    recognition and generated speech.
-   **Progress tracking:** activity records and learner progress.
-   **Gamification:** experience points (XP), achievements, and rewards.
-   **Authentication and user roles:** user accounts and role-specific
    app experiences.
-   **Parent dashboard:** intended to show linked children's learning
    activity and progress.
-   **Teacher dashboard:** intended to show linked students and their
    progress.
-   **REST API:** Node.js/Express backend for app data and business
    logic.
-   **Cloud database:** MongoDB Atlas for persistent storage.

> **Implementation note:** Dashboard navigation, linking, API wiring,
> and speech-service connectivity must be tested end-to-end. A screen or
> endpoint existing in the code does not by itself guarantee the full
> user journey works.

## Technology Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Mobile application      React Native            Cross-platform mobile
                                                  UI

  Mobile development      Expo                    Development server and
                                                  device testing

  Backend                 Node.js, Express.js     REST API and
                                                  application logic

  Database                MongoDB Atlas, Mongoose Persistent data and
                                                  object modelling

  AI service API          Python, FastAPI         Separate speech-service
                                                  endpoints

  Speech recognition      Whisper-based STT       Convert speech to text,
                          service                 where configured

  Speech generation       TTS service / custom    Generate speech audio,
                          GAN-based TTS work      where configured

  API communication       Axios / HTTP REST       Frontend-to-backend
                                                  requests

  API testing             Postman                 Manual endpoint testing

  Version control         Git and GitHub          Branch-based team
                                                  development
  -----------------------------------------------------------------------

**Important:** Specific TTS libraries, model checkpoints, training
commands, and dependencies should be documented from the AI branch's
actual `requirements.txt` and source code. Do not assume a model is
deployed merely because it is part of the intended architecture.

## System Architecture

``` text
┌────────────────────────────────────┐
│       Gyan Mobile App               │
│       React Native + Expo           │
│  Student / Parent / Teacher views   │
└──────────────────┬─────────────────┘
                   │ HTTP / REST
                   ▼
┌────────────────────────────────────┐
│       Node.js + Express API         │
│ Authentication, games, progress,    │
│ linking, achievements and rewards   │
└───────────────┬───────────┬────────┘
                │           │
                ▼           ▼
┌──────────────────────┐  ┌────────────────────────┐
│ MongoDB Atlas        │  │ Python + FastAPI        │
│ Users, activities,   │  │ Speech recognition and  │
│ progress and rewards │  │ text-to-speech services │
└──────────────────────┘  └────────────────────────┘
```

### Request flow

1.  A learner or dashboard user performs an action in the mobile app.
2.  The app sends an HTTP request to the Node/Express API.
3.  The backend validates the request and applies the relevant
    application logic.
4.  Data is read from or written to MongoDB Atlas when needed.
5.  Speech-related requests are forwarded to the AI service when that
    integration is enabled.
6.  The backend returns a response to the mobile app, which updates the
    interface.

The exact routes and request payloads should be confirmed in the current
`backend/routes/` files and API documentation.

## Supported Languages

  Code   Language
  ------ ----------
  `en`   English
  `hi`   Hindi
  `mr`   Marathi

Use the language codes expected by the API. The available learning
content and speech-model quality may differ by language.

## Project Structure

The repository has been described as containing the mobile app in
`FrontendN/`, the Node/Express backend in `backend/`, and AI
speech-service work on the `ai-tts-gan` branch. The exact internal files
can change as branches are merged.

``` text
Gyan/
├── backend/
│   ├── config/          # Database and application configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication and request middleware
│   ├── models/          # Mongoose data models
│   ├── routes/          # Express route definitions
│   ├── services/        # Shared/business services, including speech integration
│   ├── server.js        # Backend entry point (verify in current branch)
│   ├── package.json
│   └── .env             # Local secrets; do not commit
│
├── FrontendN/
│   ├── src/             # React Native application source (verify current layout)
│   ├── package.json
│   └── .env             # Public app configuration; do not put secrets here
│
└── README.md
```

The Python AI service may be maintained in a separate branch or
directory. Check out the team's current AI branch to find its actual
entry point, model files, and Python dependency list.

## Prerequisites

Install the following before running the project:

-   Node.js and npm compatible with the repository's package files.
-   Git.
-   MongoDB Atlas account and a database connection string.
-   Expo tooling and Expo Go on a compatible physical device, or an
    Android emulator.
-   Python and pip only if running the separate AI service.
-   Postman or another HTTP client for API testing.

The project has previously been tested with Node.js `24.19.0`; if native
dependencies or Expo packages fail, use the Node.js version recommended
by the current Expo/project documentation and lockfile.

## Installation and Setup

### 1. Clone the Repository

``` bash
git clone https://github.com/parthmandore/Gyan.git
cd Gyan
```

If the repository is private, ensure your GitHub account has access.

### 2. Configure the Backend

``` bash
cd backend
npm install
```

Create a local `.env` file in `backend/` using the variables in the next
section. Use the actual variable names expected by the current backend
source. Then start the server using the script defined in
`backend/package.json`, commonly:

``` bash
npm start
```

If the project defines a development script, you may instead use:

``` bash
npm run dev
```

Do not run both commands at once. Confirm the exact available scripts
with:

``` bash
npm run
```

The backend has been configured to listen on port `3000` in the
development setup. If a health route is available, test it in a browser
or API client:

``` text
http://localhost:3000/health
```

A health route may return a status response; `/` may not be defined, so
a "Cannot GET /" response does not necessarily mean the server is down.

### 3. Configure the Mobile App

Open a second terminal:

``` bash
cd FrontendN
npm install
```

Create `FrontendN/.env` and set the backend URL reachable from the
device.

**Android emulator:**

``` env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

**Physical phone on the same Wi-Fi:**

``` env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:3000
```

Replace `YOUR_COMPUTER_LAN_IP` with the computer's current local IPv4
address. Do not use the example IP from another network; LAN addresses
can change. The phone and computer should be on the same network, and
the computer firewall must allow the development port.

Start Expo:

``` bash
npx expo start
```

Use the displayed QR code with Expo Go when supported by the installed
Expo SDK. For LAN troubleshooting, try:

``` bash
npx expo start --lan
```

If you change an Expo environment variable, restart the Expo development
server and clear its cache if the old value continues to appear:

``` bash
npx expo start -c
```

Check the frontend's API configuration files (for example,
`src/services/apiClient.ts` or `src/services/apiConfig.ts`, if present)
to confirm which environment variable is actually read. Expo public
environment variables are bundled into the app and must never contain
passwords or private API keys.

### 4. Configure the AI Speech Service

The AI service is a separate Python/FastAPI component and may be
maintained on the `ai-tts-gan` branch.

Switch to the appropriate branch or obtain the team's AI service
directory. From that directory, create and activate a virtual
environment.

**Windows PowerShell:**

``` powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the dependencies listed in the AI service's own
`requirements.txt`:

``` bash
pip install -r requirements.txt
```

Start the service using the entry point documented by the AI branch. The
planned development command is:

``` bash
uvicorn ai.api.main:app --host 0.0.0.0 --port 8000
```

This command assumes the module path `ai.api.main:app` exists in the
checked-out branch. If it does not, use the entry point provided by the
actual source code.

When running locally, the planned service URLs are:

-   Health: `http://localhost:8000/health`
-   API documentation: `http://localhost:8000/docs`
-   TTS: `POST http://localhost:8000/tts`

For a phone or a backend running on another computer, replace
`localhost` with the AI computer's reachable LAN IP. Ensure the
backend's speech-service URL points to that address. The AI service must
be running for live speech requests to succeed.

### 5. Run the Application

For local development, run each required component in a separate
terminal:

  Terminal   Component                                Expected development port
  ---------- -------------------------------------- ---------------------------
  1          Node/Express backend                                        `3000`
  2          Python/FastAPI AI service, if needed                        `8000`
  3          React Native / Expo Metro                            Shown by Expo

Recommended startup order:

1.  Start MongoDB Atlas access and verify the connection string/network
    access.
2.  Start the backend and confirm its database connection log.
3.  Start the AI service if testing STT/TTS.
4.  Start Expo and open the app on the target device.
5.  Test login, a learning activity, progress updates, parent/teacher
    linking, and speech flows individually.

## Environment Variables

Use the variable names supported by the current source code. The
following are development examples based on the project's existing
configuration; verify them against the backend configuration and
frontend API client.

### `backend/.env`

``` env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
AI_SERVICE_URL=http://localhost:8000
WHISPER_BASE_URL=http://localhost:8000
AI_TIMEOUT=60000
```

-   `PORT`: Express server port.
-   `MONGODB_URI`: MongoDB Atlas connection string. The actual project
    may use a different variable name, such as `MONGO_URI`; check the
    database configuration file.
-   `AI_SERVICE_URL`: base URL used for AI/TTS integration, if read by
    the backend.
-   `WHISPER_BASE_URL`: base URL used for the Whisper/STT integration,
    if read by the backend.
-   `AI_TIMEOUT`: request timeout in milliseconds, if implemented.

### `FrontendN/.env`

``` env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
EXPO_PUBLIC_STT_API_URL=http://10.0.2.2:8000
```

The first URL is an Android-emulator example. For a physical phone, use
the reachable LAN IP address of the relevant computer. Keep frontend and
backend URL conventions consistent with the actual source code.

**Never commit `.env` files, database credentials, access tokens,
private keys, or production secrets.** Add local environment files to
`.gitignore` and provide a safe `.env.example` with placeholders.

## Backend API Overview

The Node/Express backend is responsible for authentication, user/role
data, learning activities, progress, and dashboard-related operations.

  -----------------------------------------------------------------------
  API area                            Purpose
  ----------------------------------- -----------------------------------
  Authentication                      Registration, login, and
                                      authenticated access

  Users and roles                     Student, parent, and teacher
                                      account information

  Parent/teacher linking              Associate a parent or teacher with
                                      a learner

  Games/content                       Provide learning activities and
                                      game data

  Activity records                    Store completed or attempted
                                      activities

  Progress                            Summarize learner activity and
                                      progress

  Achievements/rewards                Track milestones and reward-related
                                      data

  Speech integration                  Forward speech requests to the AI
                                      service where configured

  Health                              Check backend availability, if the
                                      route is enabled
  -----------------------------------------------------------------------

### Known game identifiers

The backend game registry has included the following identifiers:

-   `alphabet_matching`
-   `capital_small_match`
-   `vowel_matra_match`
-   `speech_word_challenge`

These are identifiers, not a guarantee that every activity is fully
connected to the UI.

### Discover the exact routes

Route names and payloads can change during integration. Do not assume
every route follows a particular URL pattern. To document the exact API:

1.  Inspect `backend/routes/`.
2.  Trace each route to its controller.
3.  Check authentication middleware and required roles.
4.  Run the backend and use Postman to verify request/response examples.
5.  Record HTTP methods, paths, authentication requirements, request
    bodies, success responses, and error responses.
6.  If the project exposes API documentation, link to it here.

Example health check:

``` bash
curl http://localhost:3000/health
```

Example registration/login payloads must be taken from the current
validators/controllers rather than copied from an assumed schema.

## AI Speech Service

The separate Python service is intended to provide speech-related
functionality for the mobile app.

### Planned TTS request

``` http
POST /tts
Content-Type: application/json
```

Example request body:

``` json
{
  "text": "Hello, welcome to Gyan.",
  "language": "en"
}
```

Supported language codes: `en`, `hi`, `mr`.

The expected audio response format for the TTS endpoint is:

-   WAV
-   22,050 Hz sample rate
-   Mono channel
-   16-bit PCM

Confirm the actual response type and error format from the current
FastAPI implementation and `/docs`. The example is an API contract
reference, not proof that the service is currently running.

### Speech-to-text

The project also includes Whisper-based speech-to-text work. Confirm the
actual STT route, accepted audio format, response schema, and
language-selection behaviour from the AI service's current source before
integrating it into a screen.

### GAN-based TTS

The project includes custom GAN-based TTS work. Model training,
checkpoint loading, inference, and audio-quality evaluation should be
documented by the team using the actual implementation. If the service
uses a fallback TTS engine, state that clearly rather than describing
the fallback as GAN-generated audio.

## Database and Data Models

MongoDB Atlas is used as the cloud database, with Mongoose in the
Node.js backend.

The backend model areas have included:

-   **User:** account/profile and role-related information.
-   **Activity:** learner activity or completed game attempts.
-   **Progress:** learner progress summaries.
-   **Achievements:** earned or available milestones.
-   **Rewards:** reward-related data.

The actual schema fields, indexes, validation rules, and references must
be taken from `backend/models/`. Avoid publishing sample personal data
or real credentials.

### Parent/teacher learner linking

Parent and teacher dashboards depend on a valid relationship between the
signed-in account and the learner. For reliable linking:

1.  Validate the request body on the server.
2.  Confirm the referenced learner exists.
3.  Check the caller's role and permission to link that learner.
4.  Prevent duplicate or unauthorized links.
5.  Return a consistent response and handle missing IDs/emails safely.
6.  Test that the linked learner appears in the correct dashboard.
7.  Confirm that one user's progress cannot be accessed by an unrelated
    account.

## Learning Activities

Gyan's learning activities are designed to provide short, repeatable
literacy practice.

  -----------------------------------------------------------------------
  Activity                            Intended practice
  ----------------------------------- -----------------------------------
  Alphabet matching                   Recognize and match letters

  Capital/small-letter matching       Associate uppercase and lowercase
                                      English letters

  Vowel--matra matching               Practise relevant vowel/matra
                                      associations in Indian-language
                                      content

  Speech/word challenge               Practise words through speech-based
                                      interaction where enabled
  -----------------------------------------------------------------------

Difficulty levels, supported alphabets, confusable-letter mappings, and
content should follow the current backend datasets and frontend
configuration.

## Parent and Teacher Dashboards

The parent and teacher experiences are intended to provide
role-appropriate access to learner information.

Potential dashboard data includes:

-   Linked children or students.
-   Recent learning activities.
-   Progress summaries.
-   Achievements and rewards.
-   Activity history.

### Integration checklist

-   [ ] Parent login opens the parent dashboard.
-   [ ] Teacher login opens the teacher dashboard.
-   [ ] Dashboard buttons navigate to their intended screens.
-   [ ] Loading, empty, success, and error states are displayed.
-   [ ] Parent/teacher APIs are called by the frontend service layer.
-   [ ] Linked learners are retrieved from the backend.
-   [ ] Progress displayed in dashboards matches saved database data.
-   [ ] Unauthorized users cannot view another learner's data.
-   [ ] API failures do not leave buttons or screens unresponsive.

Dashboard completeness should be reported only after these flows have
been tested on a running app.

## Dataset Information

The project dataset counts previously recorded for the multilingual
speech/TTS work are:

  Language      Recorded sample count
  ----------- -----------------------
  English                      13,100
  Hindi                        21,893
  Marathi                      10,939
  **Total**                **45,932**

These figures are the project's recorded counts; they should not be
interpreted as the number of validated, unique, balanced, or
training-ready samples unless the dataset has been audited.

For reproducibility, document the following in the AI branch:

-   Dataset source and licence/permission.
-   Audio and transcript format.
-   Language and speaker distribution.
-   Train/validation/test split.
-   Text normalization and audio preprocessing.
-   Handling of missing, noisy, or duplicate samples.
-   Model architecture, training configuration, and checkpoint version.
-   Evaluation metrics and sample-generation procedure.

Do not commit datasets or trained model weights to Git unless the
repository's size, licence, and data-privacy policies permit it.

## Testing

Test each layer independently before running an end-to-end
demonstration.

### Backend

-   [ ] Server starts without errors.
-   [ ] Database connection succeeds.
-   [ ] Health endpoint responds.
-   [ ] Registration and login work with valid and invalid inputs.
-   [ ] Protected routes reject missing/invalid authentication.
-   [ ] Role permissions are enforced.
-   [ ] Activity and progress data persist correctly.
-   [ ] Parent/teacher linking handles missing or invalid input.
-   [ ] Errors return useful HTTP status codes without leaking secrets.

### Mobile app

-   [ ] App starts on the target device.
-   [ ] API base URL is loaded correctly.
-   [ ] Login and logout work.
-   [ ] Student games load and respond to taps.
-   [ ] Progress screens show backend data.
-   [ ] Parent and teacher navigation works.
-   [ ] Loading, empty, and error states are handled.
-   [ ] Network failure messages are understandable.

### AI service

-   [ ] `/health` responds, if implemented.
-   [ ] `/docs` lists the current API routes.
-   [ ] TTS accepts valid text and language codes.
-   [ ] Returned audio has the expected format.
-   [ ] Unsupported languages and empty text are handled.
-   [ ] STT works with supported audio input.
-   [ ] Backend-to-AI communication works across the actual network.
-   [ ] Latency and output quality are measured.

### End-to-end

Test at least one complete learning flow: sign in → select language →
complete a game → save activity → retrieve progress → view that progress
in the appropriate dashboard.

## Troubleshooting

### 1. Frontend displays `Network Error`

-   Verify that the backend is running.
-   Check the actual API URL printed by the frontend.
-   For Android emulator, use `10.0.2.2` to reach the host computer's
    localhost.
-   For a physical phone, use the backend computer's current LAN IP.
-   Ensure both devices are on the same Wi-Fi and firewall rules allow
    the port.
-   Restart Expo after changing `.env`; use `npx expo start -c` if
    necessary.
-   Confirm that the API client reads `EXPO_PUBLIC_API_URL` rather than
    another variable.

### 2. Phone browser can reach the backend, but app requests fail

A browser test confirms basic network reachability, not necessarily that
the app uses the same URL or sends the expected request. Check the
frontend configuration, route path, HTTP method, request payload,
authentication token, and backend logs.

### 3. MongoDB Atlas connection fails

-   Confirm the connection string and database user.
-   Check Atlas network access settings.
-   Verify the password is URL-encoded if it contains special
    characters.
-   Confirm the backend loads the correct environment variable.
-   Never share the connection string in screenshots or public issue
    reports.

### 4. AI endpoint is unreachable

-   Start the Python service.
-   Check the port and host binding.
-   Replace `localhost` with the AI computer's LAN IP when the caller is
    on another machine.
-   Confirm the backend uses the correct AI base URL and endpoint.
-   Check firewall rules and the Python terminal logs.

### 5. Dashboard buttons do nothing

-   Inspect the component's `onPress` handler.
-   Confirm navigation routes are registered.
-   Confirm the screen calls the intended service function.
-   Inspect the API response and any runtime errors.
-   Check whether a transparent overlay or disabled state intercepts
    touches.
-   Test empty, loading, and error states.

### 6. Parent/teacher dashboard shows no students

-   Verify the linking request payload matches the backend controller's
    expected schema.
-   Confirm the learner identifier is supplied and validated.
-   Check the linking record in MongoDB.
-   Confirm the list endpoint filters by the authenticated
    parent/teacher.
-   Check the frontend calls the correct endpoint and renders the
    returned response.
-   Review backend logs for missing fields such as an undefined email or
    learner ID.

### 7. Android emulator is unauthorized

Unlock the emulator/device and accept the USB debugging authorization
prompt where applicable. Check the device status with:

``` bash
adb devices
```

Restart the emulator or ADB only after confirming the correct device is
selected.

## Security and Privacy

Because Gyan is designed for children, privacy and access control are
especially important.

-   Never commit `.env`, credentials, tokens, or private keys.
-   Hash passwords using a suitable password-hashing implementation.
-   Validate and sanitize all API inputs.
-   Enforce authentication and role-based authorization on the server.
-   Restrict parent/teacher access to learners they are authorized to
    view.
-   Avoid logging passwords, tokens, transcripts, or sensitive learner
    information.
-   Use HTTPS and appropriate secure configuration in deployment.
-   Obtain appropriate consent for collection and processing of
    children's data.
-   Review applicable privacy laws, institutional requirements, and
    dataset licences before deployment.
-   Do not use real child data in public demos or test fixtures.

## Current Development Notes

The project has been developed in separate frontend, backend, and AI
workstreams. Previous integration testing indicated that the backend
could start on port `3000`, connect to MongoDB Atlas, and respond to
health checks; registration was also tested. However, frontend API
configuration and dashboard integration have required debugging, and
parent/teacher learner linking has produced a missing-field error in at
least one test.

Therefore, the project should currently be treated as **under
integration and testing**. Re-run the checks in this README against the
latest merged code before presenting any item as fully functional.

## Future Scope

-   Complete end-to-end integration of all student, parent, and teacher
    flows.
-   Improve speech recognition and TTS quality across all three
    languages.
-   Evaluate the GAN-based TTS model using objective metrics and
    listener feedback.
-   Add richer, age-appropriate adaptive learning activities.
-   Improve accessibility, including readable typography, clear
    feedback, and adjustable audio controls.
-   Add analytics that help educators understand progress without
    exposing unnecessary personal data.
-   Add automated unit, API, and end-to-end tests.
-   Prepare a secure deployment pipeline and production monitoring.
-   Conduct usability testing with appropriate educator/guardian consent
    and expert guidance.

## Team Workflow

The project uses Git/GitHub with work separated into branches. Branch
names used or discussed during development include:

-   `main`
-   `backend`
-   `FrontendN` (mobile frontend directory; confirm whether a matching
    branch exists)
-   `ai-tts-gan`
-   `speech-to-text-games`

Earlier branch naming may differ from the current repository. Always
check the live branch list before merging.

Suggested workflow:

1.  Pull the latest `main`.
2.  Create or switch to the feature branch assigned to your work.
3.  Keep changes scoped to the relevant component.
4.  Test the changed code locally.
5.  Open a pull request and describe the API/schema impact.
6.  Review conflicts and run integration tests after merging.
7.  Never commit secrets or local environment files.

## Contributing

Contributions should include:

-   A clear description of the change.
-   The affected screen, endpoint, model, or AI component.
-   Setup/configuration changes, if any.
-   Reproduction steps for bug fixes.
-   Test results and known limitations.
-   Updated documentation for new environment variables or API
    contracts.

## Disclaimer

Gyan is an educational support project intended to make literacy
practice more engaging and accessible. It is not a medical diagnostic
tool and does not replace professional assessment or individualized
educational support.

## License

No licence has been specified here. Add the licence selected by the
project owners before allowing reuse or redistribution. Until then, do
not assume the repository is open-source or that its datasets and model
assets are freely reusable.
