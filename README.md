# Articulate JS Tech Challenge

This tech challenge is your chance to demonstrate all of your JS
knowledge and show off how you structure and test your code.

You'll be building a small timeline application where you get
some data about people and some various events in their lives,
and then display those events on a timeline that can be played
back, paused, and reset.

## Things we're looking for

- How well your app works, of course
- How you structure your code
- How you test your code and how thoroughly you test it

Because we want to see your overall JS skills for this, we're
limiting the tools you can use to the lightweight [Backbone][backbone],
[Underscore][underscore] (or [Lodash][lodash] if you prefer), and [jQuery][jquery], plus [RequireJS][requirejs]
for loading code. You can use any or all of these, but by all means
write vanilla JS if you're more comfortable with that than these
tools. We chose these because they're tools we use and because we
want to see how well you structure your code outside of a framework.

## General instructions

1. Fork this repo
1. Clone it to your computer
1. Build the app
1. Push to your repo
1. Email us a link to your repo when you're done

## Application Requirements

You’ll be building a small application that plays back events from a person's life. The events are described in the [timeline.json](https://github.com/articulate/timeline-tech-challenge/blob/master/timeline.json) file. The application requires a simple UI that will display the text for the event and a play and pause button.  The text of the event should read "At age [age], [firstname] [event]."

The rate at which the events should play back is 2 seconds per year of the person's life, and the event should be displayed at the correct time in that range. For example for a 50 year old man, it would take 100 seconds to play back all the events. If the second event took place at 10 years old, that event should be displayed at 20 seconds.

When you press play, the events should start being displayed and the play button should turn into a pause button. Pressing Pause should act as expected. Once all events have played the button should change to a reset button and the user should be able to restart playback.

You will not be judged on visual design, although making it look nice won’t hurt. Here is a simple wireframe of the application. And here is a [screencast of a working timeline.](http://quick.as/qv5srqe)

![wireframe](https://cloud.githubusercontent.com/assets/637211/3095396/6179e2d2-e5c7-11e3-95a8-05189df377e5.jpg)


### A few notes and requirements

- You cannot change the supplied data at all, and the data must be used as-is as a JSON file.
- The timer should be as accurate as possible, including pausing. For example, if one second has passed in the "year" and the timeline is paused, the next "year" should come up one second after resuming.
- Your app only needs to work in the latest Chrome.
- All of your code should be thoroughly tested and all tests should be passing upon submission.
- **You must have fun doing this** :dancer: :dancers: :smile:

[backbone]:   http://backbonejs.org
[underscore]: http://underscorejs.org
[lodash]:     http://lodash.com/
[jquery]:     http://jquery.com
[requirejs]:  http://requirejs.org
