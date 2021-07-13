const colors=require("colors");
const moment=require("moment");
const EventEmmiter=require("events");

class Timer {
    constructor(timeString,color){
        this.name=timeString;
        this.color=color;
    }
    isTrueInput(dateStr){
        const result=/^[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(dateStr);
        if (!result) console.log(`Введите дату(ы) ${dateStr} в формате YYYY-MM-DD-hh-mm-ss`);
        return result;
    }
    getTime(dateStr){
        const dateArr=dateStr.split("-");
        return moment([dateArr[0],dateArr[1]-1,dateArr[2],dateArr[3],dateArr[4],dateArr[5]]);
    }
    timeToFinish(){
        return this.getTime(this.name).diff(moment(), "seconds");
    }
    state(){
        return this.isTrueInput(this.name)&&this.timeToFinish()>0 ? "work" : "stop";
    }
}

const args=process.argv.slice(2);
const INTERVAL=1;
const makeColor=getColor();

const emitter=new EventEmmiter();
emitter.on("work",(timer)=>{
    console.log(`Таймер ${timer.name}: продолжается. Осталось ${timer.timeToFinish()} сек`[timer.color]);
    emitTimer(timer);
});
emitter.on("stop",(timer)=>console.log(colors.red(`Таймер ${timer.name}: завершен`)));

const timers=args.map((timerString)=>{
    emitTimer(new Timer(timerString,makeColor()));
});

function emitTimer(timer){
    setTimeout(()=>{
        emitter.emit(timer.state(),timer);
    },INTERVAL*1000);
}

function getColor(){
    const colors=["yellow","green","blue","white"];
    let color=0;
    return function (){
        return colors[color++];
    }
}



