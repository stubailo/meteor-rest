# REST for Meteor

This is the documentation site for a collection of packages intended to make it easy and natural to make your Meteor app's data accessible over HTTP.

## Available packages

1. [simple:rest](rest.md) is the umbrella package that gives you everything at once. As soon as you include it, all of your Meteor methods, publications, and collections will be accessible over a standardized HTTP API.
2. .. etc

## DDP vs. HTTP, or why you would use this

Normally, Meteor web apps get their data and call methods from the server over a stateful websocket protocol called [DDP, the Distributed Data Protocol](https://www.meteor.com/ddp). DDP has many advantages over HTTP for modern interactive applications, and there are many libraries available to consume data over DDP on a variety of platforms, so often communicating with your app directly over DDP is the best choice.

However, DDP is not always the best option when your app is communicating with an external service. If you want to provide your data to someone, HTTP is the most widespread standard for doing so. Also, sometimes DDP is overkill - for example if you just want to fetch some data from a command-line script.