// Dependencies
// * ga.js (Google Analytics)

// All but the naming implemented as per google's example at
// https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingTiming

var hourInMillis = 1000 * 60 * 60;

// last two parameters are optional
function TrackTiming(category, variable, opt_label, startTime) {
    this.category = category;
    this.variable = variable;
    this.label = opt_label;
    this.proportion = 1; // percentage of views that send back data,
                         // defaults to 1%
    this.startTime = startTime;
    this.endTime;
    this.pausedTime = 0;
    return this;
}

TrackTiming.prototype.start = function() {
    this.startTime = new Date().getTime();
    return this;
};

TrackTiming.prototype.stop = function() {
    this.endTime = new Date().getTime();
    return this;
};

// stopwatch functionality, e.g.: start -> stop -> restart -> stop (-> send)
TrackTiming.prototype.reStart = function() {
    this.pausedTime += (new Date().getTime() - this.endTime);
    return this;
};

TrackTiming.prototype.send = function() {
};

// Utility method, mainly for debugging
TrackTiming.prototype.getTime = function() {
  if (this.startTime && this.endTime) 
       { return this.endTime - this.startTime; }
  else { return undefined; }
};
