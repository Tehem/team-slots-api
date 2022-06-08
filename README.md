# Team Slots API

This small project is a tool to create Calendar slots for a team.

This first version allow to create morning duty slots:

- Create a week captain to organize shifts and coordinate
- Create daily shifts with team members

If possible, the algorithm will try to match the same amount of shift for everyone through time. Also, it will try to
not give shifts to captain on the week they are captain and the week after.

## Setup

### Setup Google Calendar API Access

You need to setup a Google Cloud Platform project with the Google Calendar API enabled. To create a project and enable
an API, refer to [this documentation](https://developers.google.com/workspace/guides/create-project).

This simple app queries Google Calendar API as yourself, so you need to have the authorization to create events and
query availabilities on all of the targetted people's calendars.

You can follow the steps described [here](https://github.com/googleapis/google-api-nodejs-client#oauth2-client) to setup
an OAuth2 client for the application.

Copy `credentials.json.example` into a new `credentials.json` file and replace values for `client_id`, `client_secret`
and `project_id` (id de client OAuth).

### Initialize calendar tokens

Once your credentials are set, you need to allow this app to use your credentials. Run this script to initialize your
token:

```command
yarn calendar:init
```

You should get a prompt to open an URL like this:

```command
  Authorize this app by visiting this url: https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.readonly&response_type=code&client_id=xxx.apps.googleusercontent.com&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob
  Enter the code from that page here:
```

Grant access and paste the provided code in the command line and press enter. Your token will be stored into
a `token.json` fil in `src/config` and a query to your calendar will be made with it to test it, you should see the
output.

### Configure templates & team

Adapt the templates in the `templates` directory to your needs. Configure your team members by creating
a `config/team.json` file (you can use the provided example file `team.json.example`).

### Local environment

Create file `.env.development.local`. Adjust the settings for your local development.

```
NODE_ENV=development
SUPERVISOR_EMAIL='your.email@your.domain'
```

## Generate slots with local script

This will generate a file in the local `batches` directory, that can be used to remove the calendar events later if
needed.

```command
NODE_ENV=development yarn ts src/scripts/create-sos-shifts.ts
```

## Delete previously created slots

You will have to provide the batch id returned by the last creation run (it is also the file name - without extension -
of a batch file in `batches` directory).

```command
NODE_ENV=development yarn ts src/scripts/delete-sos-shifts.ts
```

## API Mode (WIP)

This is still under development

### Run dev server

```command
yarn dev
```

### Run tests

```command
yarn jest
```

### Run all checks before commit

```command
yarn test
```
