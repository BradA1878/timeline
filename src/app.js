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
        if(!this.buttonElement) alert("The Button Element is not defined!");
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
        this.subscribe(new TimeLineEvent(TimeLineEvent.EVENT_PLAY, this, this.play));
        this.subscribe(new TimeLineEvent(TimeLineEvent.EVENT_PAUSE, this, this.pause));
        this.subscribe(new TimeLineEvent(TimeLineEvent.EVENT_RESET, this, this.initTimer));
        this.initTextDisplays();
        this.initOutput();
        this.initTimer();
    };
    TimeLine.prototype.initTextDisplays = function(){
        if(this.nameDivElement){
            this.nameDivElement.innerHTML = this.model.getFullName() + "'s Timeline";
        }else{
            alert("Name Element is not defined!");
            return;
        }
        var div = this.ageDivElement;
        var obj = {
            onTimer: function(timerData){
                div.innerHTML = "Current Age: " + Math.floor(timerData.seconds/2);
            },
            onReset: function(arg){
                div.innerHTML = "Current Age: 0";
            }
        };
        this.subscribe(new TimeLineEvent(TimeLineEvent.EVENT_TIMER, obj, obj.onTimer));
        this.subscribe(new TimeLineEvent(TimeLineEvent.EVENT_RESET, obj, obj.onReset));
    };
    TimeLine.prototype.initOutput = function(){
        if(this.outputElement){
            var tlOutput = new TimeLineOutput(this.outputElement);
            this.subscribe(new TimeLineEvent(TimeLineEvent.EVENT_UPDATE, tlOutput, tlOutput.onUpdate));
            this.subscribe(new TimeLineEvent(TimeLineEvent.EVENT_RESET, tlOutput, tlOutput.onReset));
        }else{
            alert("Text Area Element is no defined!");
        }
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
            if(millisecondCount >= 199){
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
        }, 0);
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
    TimeLine.prototype.observerHash = function(timeLineEvent, eventTypeArg){
        var eventType;
        if(timeLineEvent == null){
            eventType = eventTypeArg;
        }else{
            eventType = timeLineEvent.getEventType();
        }
        if(this.observers.hasOwnProperty(eventType) == false) this.observers[eventType] = [];
        return this.observers[eventType];
    };
    TimeLine.prototype.subscribe = function(timeLineEvent){
        this.observerHash(timeLineEvent).push(timeLineEvent);
    };
    TimeLine.prototype.unsubscribe = function(timeLineEvent){
        this.observerHash(timeLineEvent).forEach(function(item, index, src){
            src.splice(index, 1);
            return;
        });
    };
    TimeLine.prototype.broadcast = function(eventType, data){
        this.observerHash(null, eventType).forEach(function(item, index, src){
            src[index].notify(data);
        });
    };
    TimeLine.prototype.destroy = function(){
        for(var prop in this.observers){
            if(this.observerHash.hasOwnProperty(prop.toString()) == false) continue;
            var observerArray =  this.observerHash(prop.toString())
            observerArray.forEach(function(item, index, src){
                src[index].destroy();
            });
            observerArray.splice(0);
            observerArray = null;
        }
        this.buttonElement.onclick = null;
        this.outputElement = null;
        this.buttonElement = null;
        this.nameDivElement = null;
        this.ageDivElement = null;
        this.observers = null;
        this.duration = 0;
        this.model = null;
    };

    var TimeLineEvent = function(type, owner, ownerFunction){
        var randomNum = Math.floor((Math.random() * Math.random()) * 100);
        this.eventType = type;
        this.callBack = ownerFunction.bind(owner);
    };
    TimeLineEvent.EVENT_PLAY = "PlayEvent";
    TimeLineEvent.EVENT_PAUSE = "PauseEvent";
    TimeLineEvent.EVENT_UPDATE = "UpdateEvent";
    TimeLineEvent.EVENT_RESET = "ResetEvent";
    TimeLineEvent.EVENT_TIMER = "TimerEvent";
    TimeLineEvent.prototype.getEventType = function(){
        return this.eventType;
    };
    TimeLineEvent.prototype.notify = function(data){
        this.callBack(data);
    };
    TimeLineEvent.prototype.destroy = function(){
        this.id = null;
        this.eventType = null;
        this.callBack = null;
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