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
yarn install
yarn global add community-solid-server
```

## Demo

Start a Solid CSS server which provides a local inbox

```
yarn solid
```

Remove all data from `./in` and delete the cache file `./cache.db`.

```
yarn clean:real
```

Harvest some OAI data from an institutional repository (incremental harvesting). By 
default we process only 10 records at a time and serialize only records that contain
full text. You may want to run this command several times when a repository has very
many recent uploaded/changed records.

```
yarn oai:radboud
```

Run an orchestrator on a the files in `in/` requesting processing it with the 
`rules/offerCitationExtraction.n3` rule file. This rule request sending a notification to an
LDN inbox.

```
yarn orch
```

The previous step created files in `out` file which need to be executed. In this step the
notifiction will be sent. 

```
yarn pol
```

Visit http://localhost:3000/ces/inbox/ and check the latest incoming notification.

## Project

This code is part of the [Mellon Scholarly Communication](https://knows.idlab.ugent.be/projects/mellon/) project.

## See also

[CitationExtractorService](https://github.com/MellonScholarlyCommunication/CitationExtractorService)
[CitationRelayService](https://github.com/MellonScholarlyCommunication/CitationRelayService)