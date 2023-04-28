# OAI-Bridge

A [OAI-PMH](https://www.openarchives.org/pmh/) to [Event Notifications](https://www.eventnotifications.net).

This project provides an implementation of a OAI-PMH harvest to Event Notification bridge.
The code supports incremental harvesting of a OAI endpoint (https://biblio.ugent.be in our
example). For each new or updated OAI record a new Event Notification fragment will be 
created in the `./in` directory. These Event Notification fragments can then be further
processed in sending out Event Notifications, creating Event Logs and sending Mastodon 
toots using the [Koreografeye](https://github.com/eyereasoner/Koreografeye) project.

## Node

v16.13.0

## Install

```
npm install
npm install -g community-solid-server
```

## Demo

Start a Solid CSS server which provides a local inbox

```
bin/solid.sh
```

Remove all data from `./in` and delete the cache file `./biblio.db`.

```
npm run clean:real
```

Harvest some OAI data from an institutional repository (incremental harvesting). By 
default we process only 10 records at a time and serialize only records that contain
full text. You may want to run this command several times when a repository has very
many recent uploaded/changed records.

```
npm run oai:biblio
```

Run an orchestrator on a the files in `in/` requesting processing it with the 
`rules/sendNotification.n3` rule file. This rule request sending a notification to an
LDN inbox.

The previous step created files in `out` file which need to be executed. In this step the
notifiction will be sent. 

```
npm run pol
```

Visit http://localhost:3000/service/inbox/ and check the latest incoming notification.

## Customize

Customize the experiment by creating a copy of `rules/sendNotification.n3` and run 
the `orch` and `pol` commands as:

```
npx orch --info --in in --out out --err err rules/your-custom-rules.n3
npx pol --info --in out
```

## Project

This code is part of the [Mellon Scholarly Communication](https://knows.idlab.ugent.be/projects/mellon/) project.

## See also

[CitationExtractorService](https://github.com/MellonScholarlyCommunication/CitationExtractorService)