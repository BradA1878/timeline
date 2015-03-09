(function(scope){

    var STATE_PLAY = "PLAY";
    var STATE_PAUSE = "PAUSE";
    var STATE_RESET = "RESET";
    var EVENT_PLAY = "PlayEvent";
    var EVENT_PAUSE = "PauseEvent";
    var EVENT_UPDATE = "UpdateEvent";
    var EVENT_RESET = "ResetEvent";
    var EVENT_TIMER = "TimerEvent";

    var outputElement = scope.getElementById("output");
    var buttonElement = scope.getElementById("btn");
    var nameDivElement = scope.getElementById("fullNameDisplay");
    var ageDivElement = scope.getElementById("ageDisplay");
    var observers = {};
    var duration = 0;
    var model = null;
    var playState = false;
    var dataFile = "./data/timeline.json";
    var firstName = "";

    var observerHash = function(event){
        if(observers.hasOwnProperty(event) == false) observers[event] = [];
        return observers[event];
    };
    var subscribe = function(event, callBack){
        observerHash(event).push({event:event, callBack:callBack});
    };
    var broadcast = function(event, data){
        var observers = observerHash(event);
        var len = observers.length;
        for(var index = 0; index < len; index++) observers[index].callBack.call(this, data);
    };

    var init = function(data){
        firstName = data.firstName;
        var fname = data.firstName;
        var lname = data.lastName;
        var age = data.age;
        var events = data.events;
        model = {
            getFirstName: function(){ return fname; },
            getLastName: function(){ return lname; },
            getFullName: function(){ return (fname + " " + lname); },
            getAge: function(){ return age; },
            getEventArray: function(){ return events; },
            getEventAt: function(index){
                return {age: model.getAge(), name: model.getFirstName(), event: events[index]};
            }
        };
        duration = (model.getAge() * 2);
        var _setState = function(state){
            buttonElement.value = state;
        };
        buttonElement.onclick = function(){
            var state = buttonElement.value;
            if(state == STATE_RESET){
                _setState(STATE_PLAY);
                broadcast(EVENT_RESET);
                return;
            }
            if(state == STATE_PLAY){
                _setState(STATE_PAUSE);
                broadcast(EVENT_PLAY);
            }else{
                _setState(STATE_PLAY);
                broadcast(EVENT_PAUSE);
            }
        };
        _setState(STATE_PLAY);
        subscribe(EVENT_PLAY, play);
        subscribe(EVENT_PAUSE, pause);
        subscribe(EVENT_RESET, initTimer);
        initTextDisplays();
        initOutput();
        initTimer();
    };

    var initTextDisplays = function(){
        nameDivElement.innerHTML = model.getFullName() + "'s Timeline";
        var div = ageDivElement;
        var obj = {
            onTimer: function(timerData){
                div.innerHTML = "Current Age: " + Math.floor(timerData.seconds/2);
            },
            onReset: function(arg){
                div.innerHTML = "Current Age: 0";
            }
        };
        subscribe(EVENT_TIMER, (function(owner){ return owner.onTimer; })(obj));
        subscribe(EVENT_RESET, (function(owner){ return owner.onReset; })(obj));
    };

    var initOutput = function(){
        subscribe(EVENT_UPDATE, function(data){
            var currentOutput = outputElement.value;
            if(currentOutput) currentOutput += "\n";
            currentOutput += "At age " + data.event.age;
            currentOutput += ", ";
            currentOutput += firstName;
            currentOutput += " ";
            currentOutput += data.event.content;
            outputElement.value = currentOutput;
        });
        subscribe(EVENT_RESET, function(){
            outputElement.value = "";
        });
    };

    var initTimer = function(){
        var eventMilestones = [];
        var len = model.getEventArray().length;
        for(var index = 0; index < len; index++){
            var milestone = model.getEventAt(index);
            eventMilestones.push(milestone.event.age);
        }
        var millisecondCount = 0;
        var secondCount = 0;
        var milestoneInterval = Math.floor(duration/len);
        var currentEventIndex = 0;
        var interval = window.setInterval(function(){
            if(playState == false) return;
            millisecondCount++;
            if(millisecondCount >= 9){
                millisecondCount = 0;
                secondCount++;
            }
            broadcast(EVENT_TIMER, {index:currentEventIndex, seconds:secondCount});
            if(secondCount >= (eventMilestones[currentEventIndex] * 2)){
                broadcast(EVENT_UPDATE, model.getEventAt(currentEventIndex));
                currentEventIndex++;
            }
            if(currentEventIndex >= len){
                window.clearInterval(interval);
                onEndOfTimeLine();
            }
        }, 100);
    };

    var play = function(){
        playState = true;
    };

    var pause = function(){
        playState = false;
    };

    var onEndOfTimeLine = function(){
        playState = false;
        buttonElement.value = STATE_RESET;
    };

    (function(arg, callBack){
        var request = new XMLHttpRequest();
        request.overrideMimeType("application/json");
        request.onreadystatechange = function(){
            if(request.readyState == 4 && request.status == "200"){
                callBack(request.responseText);
            }
        };
        request.open('get', arg, true);
        request.send();
    })(dataFile, function(response){
        var data;
        try{
            data = JSON.parse(response);
        }catch(e){
            alert("Bad JSON Data!");
            return;
        }
        init(data);
    });

})(document);
