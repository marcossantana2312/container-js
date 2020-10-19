const Container = require('./container');
const { readFileSync } = require("fs")
const net = require('net');

const CONTAINER_ID = getRandomValue(1, 1000);

const GarbageTypes = {
    Paper: "PAPEL",
    Glass: "VIDRO",
    Metal: "METAL",
    Plastic: "PLASTICO"
}

function getRandomValue(min = 1, max = 10) {
    return Math.floor(Math.random() * (max - min + 1)) + 1;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const handleContainer = async (containersArray, centralClient) => {
    console.log("HANDLE CONTAINERS")

    async function incrementOrArlet(container) {
        while (container.verifyLimit()) {
            await sleep(250);
            container.putGarbage(getRandomValue())
        }
        // centralClient.write(`CHEIO DE LIXO TIPO: ${container.type}`)
        // console.log(`CHEIO DE LIXO TIPO: ${container.type}`)
    }

    await Promise.all(
        containersArray.map(async container => await incrementOrArlet(container))
    );

    // MANDAR CONTAINER ID PRA CENTRAL
    console.log(`CHEIO ${CONTAINER_ID}`)
    centralClient.write(`CHEIO ${CONTAINER_ID} \n`);
    containersArray.map(container => container.resetCount());
};

(async () => {
    const file = readFileSync(__dirname + "/lista_dispositivo.txt");

    const devices = file.toString().split("\n").map((e) => {
        return {
            ip: e.split(" ")[1],
            port: parseInt(e.split(" ")[0], 10)
        }
    });

    let i = 0;
    const containersArray = [
        new Container(GarbageTypes.Paper),
        new Container(GarbageTypes.Glass),
        new Container(GarbageTypes.Metal),
        new Container(GarbageTypes.Plastic)
    ]
    let { ip, port } = devices[i];
    let centralClient = net.connect(port, ip);
    
    centralClient.on("error", (err) => {
        try {
            console.log(err);
            i++;
            ({ ip, port } = devices[i]);
            centralClient = net.connect(port, ip);
            handleContainer(containersArray, centralClient);
        } catch (error) {
            console.log(error)
        }
    })

    centralClient.on("data", async (data) => {
        try {
            console.log(data.toString());
            if (data.toString().includes("CHEGUEI_CONTAINER")) {
                await sleep(getRandomValue() * 1000);
                handleContainer(containersArray, centralClient);
            }
        } catch (err) {
            console.log(err)
        }
    })

    handleContainer(containersArray, centralClient);
})()