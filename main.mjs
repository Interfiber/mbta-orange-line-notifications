import fetch from 'node-fetch';
import notifier from 'node-notifier';

const LINE = "Orange";

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

function placeToName(id){
    let baseName = id.replace("place-", "");

    if (baseName == "masta"){
        return "Mass Ave";
    } else if (baseName == "grnst"){
        return "Green St";
    } else if (baseName == "forhl"){
        return "Forest Hills";
    } else if (baseName == "tumnl"){
        return "Tufts Medical";
    } else if (baseName == "bbsta") {
        return "Back Bay";
    } else if (baseName == "north"){
        return "North Station";
    } else if (baseName == "sull"){
        return "Sullivan Square";
    } else if (baseName == "mlmnl"){
        return "Malden Center";
    } else if (baseName == "ogmnl"){
        return "Oak Grove";
    } else if (baseName == "welln"){
        return "Wellington";
    } else if (baseName == "state"){
        return "State";
    } else if (baseName == "rcmnl"){
        return "Roxbury Crossing";
    } else if (baseName == "jaksn"){
        return "Jackson Square";
    } else if (baseName == "chncl"){
        return "Chinatown";
    } else if (baseName == "astao"){
        return "Assembly";
    } else if (baseName == "ccmnl"){
        return "Community College";
    } else if (baseName == "haecl"){
        return "Haymarket";
    } else if (baseName == "dwnxg"){
        return "Downtown Crossing";
    } else if (baseName == "rugg"){
        return "Ruggles";
    } else if (baseName == "sbmnl"){
        return "Stony Brook";
    }
}


async function fetchTrainData(){
    let trainFetch = await fetch(`https://traintracker.transitmatters.org/trains/${LINE}`);
    console.log("[HTTP GET] ", trainFetch.url);
    return await trainFetch.json();
}

async function sendLeaveUpdate(oldTrain, newTrain){
    notifier.notify({
        title: "Train left station",
        message: `#${oldTrain.label} left station ${placeToName(newTrain.stationId)}`
    })
}

async function sendIncomingUpdate(oldTrain, newTrain){
    // notifier.notify({
    //     title: "Train incoming at station",
    //     message: `${newTrain.label} incoming at ${newTrain.stationId}`
    // })
}

async function sendStoppedUpdate(train){
    notifier.notify({
        title: "Train stopped at station",
        message: `#${train.label} stopped at ${placeToName(train.stationId)}`
    })
}

notifier.notify("Started train tracker");
console.log("Making first API request");
let trainData = await fetchTrainData();
// console.log(trainData);

while (true){
    // compare
    let tmpData = await fetchTrainData();

    if (tmpData.length != trainData.length){
        console.log("[ERROR] New train added to Orange line tracks, cannot compare data sets!");
    }

    // check if the data is the same
    for (let i in tmpData){
        let train = tmpData[i];
        let oldTrain = trainData[i];

        if (train.currentStatus != oldTrain.currentStatus){
            if (train.currentStatus == "INCOMING_AT"){
                await sendIncomingUpdate(oldTrain, train);
            } else if (train.currentStatus == "IN_TRANSIT_TO") {
                await sendLeaveUpdate(oldTrain, train);
            } else if (train.currentStatus == "STOPPED_AT") {
                await sendStoppedUpdate(train);
            } else {
                console.log(`[ERROR] Invalid train state: ${train.currentStatus}`);
            }
        }
    }

    trainData = tmpData;

    await sleep(3*1000);
}
