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
npm run demo:oai
```

Run an orchestrator on a single `demo/1.ttl` file requesting processing it with the 
`rules/sendNotification.n3` rule file. This rule requests to send `sorg:AboutPage` with
at least an `as:url` to a test inbox of the COAR notify project.

```
npm run demo:orch-ldn
```

The previous step created a `out/1.ttl` file which need to be executed. This still will
send out the requested Event Notification to the COAR [demo inbox](https://ldninbox.antleaf.com/inbox).

```
npm run demo:pol
```

Visit https://ldninbox.antleaf.com/inbox and check the latest incoming notification.

# Project

This code is part of the [Mellon Scholarly Communication](https://knows.idlab.ugent.be/projects/mellon/) project.