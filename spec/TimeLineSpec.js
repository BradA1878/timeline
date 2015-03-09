describe("TimeLine App Tests", function(){

    describe("Testing the timer math", function(){

        var milestoneCallBack, endCallBack;

        beforeEach(function(){
            milestoneCallBack = jasmine.createSpy("milestoneCallBack");
            endCallBack = jasmine.createSpy("endCallBack");
        });

        afterEach(function(){

        });

        var eventMilestones = [0, 4, 12, 17, 21, 27, 32, 37, 42];
        var len = eventMilestones.length;
        var age = 49;
        var duration = (age * 2);
        var millisecondCount = 0;
        var secondCount = 0;
        var milestoneInterval = Math.floor(duration/len);
        var currentEventIndex = 0;
        var interval = function(){
            if(currentEventIndex >= len){
                endCallBack();
                return;
            }
            if(secondCount >= (eventMilestones[currentEventIndex] * 2)){
                milestoneCallBack();
                currentEventIndex++;
            }
        };

        it("No milestone hit ", function(){
            currentEventIndex = 1;
            secondCount = 3;
            interval();
            expect(milestoneCallBack).not.toHaveBeenCalled();
        });

        it("First milestone hit", function(){
            currentEventIndex = 0;
            secondCount = 1;
            interval();
            expect(milestoneCallBack).toHaveBeenCalled();
        });

        it("Second milestone hit", function(){
            currentEventIndex = 0;
            secondCount = 8;
            interval();
            expect(milestoneCallBack).toHaveBeenCalled();
        });

        it("Third milestone hit", function(){
            currentEventIndex = 1;
            secondCount = 25;
            interval();
            expect(milestoneCallBack).toHaveBeenCalled();
        });

        it("End hit", function(){
            currentEventIndex = 9;
            secondCount = 84;
            interval();
            expect(milestoneCallBack).not.toHaveBeenCalled();
            expect(endCallBack).toHaveBeenCalled();
        });

    });

});