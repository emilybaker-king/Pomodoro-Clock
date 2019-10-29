
$(function() {
    let clock = new Clock();
    clock.displayCurrentTime();
    clock.displaySessionTime();
    clock.displayBreakTime();
    clock.displaySessionCount();

    //Event listeners
    $(".time-session .plus").click(function() {
        clock.changeSessionTime("add");
    });
    $(".time-session .minus").click(function() {
        clock.changeSessionTime("subtract");
    });
    $(".time-break .plus").click(function() {
        clock.changeBreakTime("add");
    });
    $(".time-break .minus").click(function() {
        clock.changeBreakTime("subtract");
    });
    $(".time-start").click(function() {
        clock.toggleClock();
    })
    $(".time-reset").click(function() {
        clock.reset();
    })
});

function Clock() {

    var startTime = 1500, //starting time for our timer in seconds
        currentTime = 1500, //current time for our timer in seconds
        sessionTime = 1500, // length os a session in seconds
        breakTime = 300, //length of a break in seconds
        sessionCount = 0, //the number of sessions
        mode = "Session", //keeps track of what mode we're in - session or break
        active = false, //if the clock is running or not
        _this = this, //refereence to the clock itself
        timer; //reference to the interval to make the timer run
        startAudio = new Audio("../assets/start.mp3");
        endAudio = new Audio("../assets/end.mp3");

    //DISPLAY FUNCTIONS

    //function to convert a number of seconds into a formatted time string
    function formatTime(secs) {
        var result = "";
        let seconds = secs % 60;
        let minutes = parseInt(secs / 60) % 60;
        let hours = parseInt(secs / 3600);

        //function adds leading zero if minutes/seconds are less than 10
        function addLeadingZeroes(time) {
            if (time < 10) {
                return "0" + time;
            } else {
                return time;
            }
        }

        //if we have a value for hours greater than 0, we need to show it on our time output
        if (hours > 0) {
            result += (hours + ":");
        }

        //build up the results string with minutes and seconds
        result += (addLeadingZeroes(minutes) + ":" + addLeadingZeroes(seconds));

        //return the result string
        return result;
    }

    //function to display the time remaining on the timer
    this.displayCurrentTime = function() {
        $('.main-display').text(formatTime(currentTime));

        //update the class for the progress radial to be either break or session depending on what mode we're in
        if (mode === "Session" && $('.progress-radial').hasClass('break')) {
            $('.progress-radial').removeClass('break').addClass('session');
        } else if (mode === "Break" && $('.progress-radial').hasClass('session')) {
            $('.progress-radial').removeClass('session').addClass('break');
        }

        //set up the step class for the radial
        $('.progress-radial').attr('class', function(index, currentValue) {
            return currentValue.replace(/(^|\s)step-\S+/g, " step-" + (100 - parseInt((currentTime/startTime) * 100)));
        });

        console.log($('.progress-radial').attr('class'));
    }

    //function to display the session time
    this.displaySessionTime = function() {
        $('.time-session-display').text(parseInt(sessionTime / 60) + "min");
    }

    //function to display the break time
    this.displayBreakTime = function() {
        $('.time-break-display').text(parseInt(breakTime / 60) + "min");
    }

    //function to control the session count text
    this.displaySessionCount = function () {
        //if our session count is 0, we should show the text Pomodoro Clock
        if (sessionCount === 0) {
            $('.session-count').html("<h2>Pomodoro Clock</h2>");
        } else if (mode === "Session") {
            //if our session count is > 0 and we are in a session, we should show which session we're in
            $('.session-count').html("<h2>Session " + sessionCount + "</h2>");
        } else if (mode === "Break") {
            //if we are in a break, we should show the text break
            $('.session-count').html("<h2>Break!</h2>");
        }
    }

    //CHANGE TIME FUNCTIONS

    //function to add or subtract 60 seconds from the session time whenever the plus or minus buttons are interacted with
    this.changeSessionTime = function(command) {
        if (!active) {
            if (command === "add") {
                //add a minute to our session time
                sessionTime += 60;
            } else if (sessionTime > 60) {
                //if session time is greater that 1 min, subtract a min from it
                sessionTime -= 60;
            }
            currentTime = sessionTime;
            startTime = sessionTime;
            this.displaySessionTime();
            this.displayCurrentTime();
        }
    }

    //function toadd or remove 60 sec to break time when the plus or minus buttons are interacted with
    this.changeBreakTime = function(command) {
        if (!active) {
            if (command === "add") {
                //add a minute to our break time
                breakTime += 60;
            } else if (breakTime > 60) {
                //if break time is greater that 1 min, subtract a min from it
                breakTime -= 60;
            }
            this.displayBreakTime();
        }
    }

    //toggle the clock between running and paused
    this.toggleClock = function() {
        if (!active) {
            //start the clock running
            active = true;
            if (sessionCount === 0) {
                sessionCount = 1;
                this.displaySessionCount();
            }
            $(".time-start").text("Pause");
            timer = setInterval(function () {
                _this.stepDown();
            }, 1000);
        } else {
            $(".time-start").text("Start");
            active = false;
            clearInterval(timer);
        }
    }

    //subtract one second from current time, display the new current time, and when time runs out alternate between session and break.
    this.stepDown = function() {
        if (currentTime > 0) {
            currentTime--;
            this.displayCurrentTime();
            if (currentTime === 0) {
                if (mode === "Session") {
                    mode = "Break";
                    currentTime = breakTime;
                    startTime = breakTime;
                    this.displaySessionCount();
                    endAudio.play();
                } else {
                    mode = "Session";
                    currentTime = sessionTime;
                    startTime = sessionTime;
                    sessionCount++;
                    this.displaySessionCount();
                    endAudio.play();
                }
            }
        }
    }

    //Function to reset the timer
    this.reset = function() {
        //clear the timer interval so the clock stops counting down if it's active
        clearInterval(timer);
        //set active to false, make sure it's not running
        active = false;
        //reset our mode to Session
        mode = "Session";
        //reset the currentTime to the sessionTime
        currentTime = sessionTime;
        //reset session count
        sessionCount = 0;
        //make sure the text for the start/pause button is set to start
        $('.time-start').text('Start');

        //Display the correct current time, session time, and session count
        this.displayCurrentTime();
        this.displaySessionCount();
        this.displaySessionTime();
    }

}