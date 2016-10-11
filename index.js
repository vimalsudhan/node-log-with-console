const cluster=require("cluster");

var availablePattern=["date","processname","file"];
var pattern=["date","processname","file"];

var setPattern=function(newPattern){
    var validatedPattern=[];
    newPattern.forEach(function(np){
        if(availablePattern.indexOf(np)!=-1)
            validatedPattern.push(np);
    });
	pattern=validatedPattern;
};

var patternMap={

    date:function(){
        return new Date().toString();
    },

    processname:function(){
        if(cluster.isMaster)
            return "MASTER";
        else{
            if(process.env.isTasker==1)
                return "TASKER";
            return "WORKER"+cluster.worker.id;
        };
    },

    file:function(){
        try{
            return new Error().stack.split("\n")[7].match(/(\/.*:[0-9]*:[0-9]*)/).pop().split("/").pop();
        }catch(e){
            return "";
        }
    },

};

var constructPattern=function(){
    var patternStrings=[];
    pattern.forEach(function(segment){
        patternStrings.push(patternMap[segment]());
    });
    return "["+patternStrings.join("] [")+"] ";
};

if(console && console.log){

    var oldLog = console.log;
    var oldTrace = console.trace;

    var getWorker=function(){
    };

    var customLog = function(){
        arguments[0]=constructPattern() + arguments[0];
//        arguments[0]="["+new Date().toString() + '] [' +getWorker()+ '] [' + getTrace()+"] "+ arguments[0];
        oldLog.apply(this, arguments);
    };

    var getTrace=function(){
        try{
            return new Error().stack.split("\n")[7].match(/(\/.*:[0-9]*:[0-9]*)/).pop().split("/").pop();
        }catch(e){
            return "";
        }
    };

    // new method in console to create empty lines
    console.emptyLines=function(lines){
        if(typeof lines=="undefined")
            lines=3;

        for(var i=0; i<lines; i++) oldLog("");
    };

    console.log = function(){
        if(typeof arguments[0] == 'object')
            Array.prototype.unshift.call(arguments, 'INFO ');
        else
            arguments[0]= 'LOG '+arguments[0];
        customLog.apply(this,arguments);
    };

    console.info = function(){
        if(typeof arguments[0] == 'object')
            Array.prototype.unshift.call(arguments, 'INFO ');
        else
            arguments[0]= 'INFO '+arguments[0];
        customLog.apply(this,arguments);
    };

    console.error = function(){
        if(typeof arguments[0] == 'object')
         Array.prototype.unshift.call(arguments, 'ERROR ');
        else
         arguments[0]= 'ERROR '+arguments[0];
        customLog.apply(this,arguments);
    };

    console.warn = function(){
        if(typeof arguments[0] == 'object')
         Array.prototype.unshift.call(arguments, 'WARN ');
        else
         arguments[0]= 'WARN '+arguments[0];
        customLog.apply(this,arguments);
    };

}

var self=module.exports={

    setPattern:function(newPattern){
        if(!Array.isArray(newPattern))
            newPattern=Array.from(arguments);
        setPattern(newPattern);
    }

};
