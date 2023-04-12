# OAI-Bridge

A [OAI-PMH](https://www.openarchives.org/pmh/) to [Event Notifications](https://www.eventnotifications.net).

This project provides an implementation of a OAI-PMH harvest to Event Notification bridge.
The code supports incremental harvesting of a OAI endpoint (https://biblio.ugent.be in our
example). For each new or updated OAI record a new Event Notification fragment will be 
created in the `./in` directory. These Event Notification fragments can then be further
processed in sending out Event Notifications, creating Event Logs and sending Mastodon 
toots using the [Koreografeye](https://github.com/eyereasoner/Koreografeye) project.

# Install

```
npm install
```

# Demo

Remove all data from `./in` and delete the cache file `./biblio.db`.

```
npm run clean:real
```

Harvest the OAI data of the last two days and generate Event Notification fragments only
of the changed records

```
npm run demo
```

# Project

This code is part of the [Mellon Scholarly Communication](https://knows.idlab.ugent.be/projects/mellon/) project.