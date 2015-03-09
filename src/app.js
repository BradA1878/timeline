(function(scope){

    var TimeLine = function(container, dataFile){
        this.outputElement = container.getElementById("output");
        this.buttonElement = container.getElementById("btn");
        this.nameDivElement = container.getElementById("fullNameDisplay");
        this.ageDivElement = container.getElementById("ageDisplay");
        this.observers = {};
        this.duration = 0;
        this.model = null;
        this.playState = false;
        var _classScope = this;
        var _loadData = function(arg, callBack){
            var request = new XMLHttpRequest();
            request.overrideMimeType("application/json");
            request.onreadystatechange = function(){
                if(request.readyState == 4 && request.status == "200"){
                    callBack(request.responseText);
                }
            };
            request.open('get', arg, true);
            request.send();
        };
        _loadData(dataFile, function(response){
            var data;
            try{
                data = JSON.parse(response);
            }catch(e){
                alert("Bad JSON Data!");
                return;
            }
            _classScope.init(data);
        });
    };
    TimeLine.PLAY = "PLAY";
    TimeLine.PAUSE = "PAUSE";
    TimeLine.RESET = "RESET";
    TimeLine.prototype.init = function(data){
        this.model = new TimeLineModel(data);
        this.duration = (this.model.getAge() * 2);
        var _classScope = this;
        var _setState = function(state){
            _classScope.buttonElement.value = state;
        };
        this.buttonElement.onclick = function(){
            var state = _classScope.buttonElement.value;
            if(state == TimeLine.RESET){
                _setState(TimeLine.PLAY);
                _classScope.broadcast(TimeLineEvent.EVENT_RESET);
                return;
            }
            if(state == TimeLine.PLAY){
                _setState(TimeLine.PAUSE);
                _classScope.broadcast(TimeLineEvent.EVENT_PLAY);
            }else{
                _setState(TimeLine.PLAY);
                _classScope.broadcast(TimeLineEvent.EVENT_PAUSE);
            }
        };
        _setState(TimeLine.PLAY);
        this.subscribe(new TimeLineEvent(TimeLineEvent.EVENT_PLAY, this, "play"));
        this.subscribe(new TimeLineEvent(TimeLineEvent.EVENT_PAUSE, this, "pause"));
        this.subscribe(new TimeLineEvent(TimeLineEvent.EVENT_RESET, this, "initTimer"));
        this.initTextDisplays();
        this.initOutput();
        this.initTimer();
    };
    TimeLine.prototype.initTextDisplays = function(){
        this.nameDivElement.innerHTML = this.model.getFullName() + "'s Timeline";
        var div = this.ageDivElement;
        var obj = {
            onTimer: function(timerData){
                div.innerHTML = "Current Age: " + Math.floor(timerData.seconds/2);
            },
            onReset: function(arg){
                div.innerHTML = "Current Age: 0";
            }
        };
        this.subscribe(new TimeLineEvent(TimeLineEvent.EVENT_TIMER, obj, "onTimer"));
        this.subscribe(new TimeLineEvent(TimeLineEvent.EVENT_RESET, obj, "onReset"));
    };
    TimeLine.prototype.initOutput = function(){
        var tlOutput = new TimeLineOutput(this.outputElement);
        this.subscribe(new TimeLineEvent(TimeLineEvent.EVENT_UPDATE, tlOutput, "onUpdate"));
        this.subscribe(new TimeLineEvent(TimeLineEvent.EVENT_RESET, tlOutput, "onReset"));
    };
    TimeLine.prototype.initTimer = function(){
        var _classScope = this;
        var eventMilestones = [];
        var len = this.model.getEventArray().length;
        for(var index = 0; index < len; index++){
            var milestone = this.model.getEventAt(index);
            eventMilestones.push(milestone.getEventAge());
        }
        var millisecondCount = 0;
        var secondCount = 0;
        var milestoneInterval = Math.floor(this.duration/len);
        var currentEventIndex = 0;
        var interval = window.setInterval(function(){
            if(_classScope.playState == false) return;
            millisecondCount++;
            if(millisecondCount >= 9){
                millisecondCount = 0;
                secondCount++;
            }
            _classScope.broadcast(TimeLineEvent.EVENT_TIMER, {index:currentEventIndex, seconds:secondCount});
            if(secondCount >= (eventMilestones[currentEventIndex] * 2)){
                _classScope.broadcast(TimeLineEvent.EVENT_UPDATE, _classScope.model.getEventAt(currentEventIndex));
                currentEventIndex++;
            }
            if(currentEventIndex >= len){
                window.clearInterval(interval);
                _classScope.onEndOfTimeLine();
            }
        }, 100);
    };
    TimeLine.prototype.play = function(){
        this.playState = true;
    };
    TimeLine.prototype.pause = function(){
        this.playState = false;
    };
    TimeLine.prototype.onEndOfTimeLine = function(){
        this.playState = false;
        this.buttonElement.value = TimeLine.RESET;
    };
    TimeLine.prototype.subscribe = function(timeLineEvent){
        var eventType = timeLineEvent.getEventType();
        if(this.observers.hasOwnProperty(eventType) == false) this.observers[eventType] = [];
        this.observers[eventType].push(timeLineEvent);
    };
    TimeLine.prototype.unsubscribe = function(timeLineEvent){
        var eventType = timeLineEvent.getEventType();
        if(this.observers.hasOwnProperty(eventType) == false) return;
        var a = this.observers[eventType];
        var len = a.length;
        for(var index = 0; index < len; index++){
            if(a[index].toString() == timeLineEvent.toString()){
                this.observers[eventType].splice(index, 1);
                break;
            }
        }
    };
    TimeLine.prototype.broadcast = function(eventType, data){
        //console.log("TimeLine.broadcast(" + eventType + ", " + data + ");");
        if(this.observers.hasOwnProperty(eventType) == false) return;
        var observers = this.observers[eventType];
        var len = observers.length;
        for(var index = 0; index < len; index++) observers[index].notify(data);
    };
    TimeLine.prototype.destroy = function(){
        for(var prop in this.observers){
            var observerArray = this.observers[prop];
            var len = observerArray.length;
            for(var index = 0; index < len; index++) observerArray[index].destroy();
            observerArray.splice(0);
            observerArray = null;
            this.observers[prop] = null;
        }
    };

    var TimeLineEvent = function(type, owner, ownerFunctionName){
        var randomNum = Math.floor((Math.random() * Math.random()) * 100);
        this.id = (type + "_" + ownerFunctionName + "_" + randomNum);
        this.eventType = type;
        this.eventOwner = owner;
        this.eventOwnerFunctionName = ownerFunctionName;
    };
    TimeLineEvent.EVENT_PLAY = "PlayEvent";
    TimeLineEvent.EVENT_PAUSE = "PauseEvent";
    TimeLineEvent.EVENT_UPDATE = "UpdateEvent";
    TimeLineEvent.EVENT_RESET = "ResetEvent";
    TimeLineEvent.EVENT_TIMER = "TimerEvent";
    TimeLineEvent.prototype.getEventType = function(){
        return this.eventType;
    };
    TimeLineEvent.prototype.getEventData = function(){
        return this.eventData;
    };
    TimeLineEvent.prototype.notify = function(data){
        this.eventOwner[this.eventOwnerFunctionName](data);
    };
    TimeLineEvent.prototype.destroy = function(){
        this.id = null;
        this.eventType = null;
        this.eventOwner = null;
        this.eventOwnerFunctionName = null;
        this.eventData = null;
    };
    TimeLineEvent.prototype.toString = function(){
        return "TimeLineEvent{" + this.id + "}";
    };

    var TimeLineModel = function(data){
        this.fname = data.firstName;
        this.lname = data.lastName;
        this.age = data.age;
        this.events = data.events;
    };
    TimeLineModel.prototype.getFirstName = function(){
        return this.fname;
    };
    TimeLineModel.prototype.getFirstName = function(){
        return this.fname;
    };
    TimeLineModel.prototype.getLastName = function(){
        return this.lname;
    };
    TimeLineModel.prototype.getFullName = function(){
        return (this.fname + " " + this.lname);
    };
    TimeLineModel.prototype.getAge = function(){
        return this.age;
    };
    TimeLineModel.prototype.getEventAt = function(index){
        return new TimeLineEventModel(this.getAge(), this.getFirstName(), this.events[index]);
    };
    TimeLineModel.prototype.getEventArray = function(){
        return this.events;
    };
    TimeLineModel.prototype.toString = function(){
        return "TimeLineModel{" + this.getFullName() + "}";
    };

    var TimeLineEventModel = function(age, name, eventData){
        this.age = age;
        this.name = name;
        this.event = eventData;
    };
    TimeLineEventModel.prototype.getAge = function(){
        return this.age;
    };
    TimeLineEventModel.prototype.getName = function(){
        return this.name;
    };
    TimeLineEventModel.prototype.getEventContent = function(){
        return this.event.content;
    };
    TimeLineEventModel.prototype.getEventAge = function(){
        return this.event.age;
    };

    var TimeLineOutput = function(textArea){
        this.textArea = textArea;
    };
    TimeLineOutput.prototype.onUpdate = function(timeLineEventModel){
        var currentOutput = this.getValue();
        if(currentOutput) currentOutput += "\n";
        currentOutput += "At age " + timeLineEventModel.getEventAge();
        currentOutput += ", ";
        currentOutput += timeLineEventModel.getName();
        currentOutput += " ";
        currentOutput += timeLineEventModel.getEventContent();
        this.setValue(currentOutput);
    };
    TimeLineOutput.prototype.onReset = function(){
        this.setValue("");
    };
    TimeLineOutput.prototype.getValue = function(){
        return this.textArea.value;
    };
    TimeLineOutput.prototype.setValue = function(arg){
        this.textArea.value = arg;
    };

    var timeLineInstance = new TimeLine(scope, "./data/timeline.json");

})(document);