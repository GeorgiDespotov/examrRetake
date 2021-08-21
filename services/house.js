const House = require('../modews/House');

async function getOneHouse(id) {
    const house = await House.findById(id).lean();

    return house;
}


async function getAllHouses() {
    const houses = await House.find().lean(); 

    return houses;
}

async function createHouse(houseData) {
    const house = new House(houseData);

    await house.save();

    return house;
}

async function rent(userId, houseId) {
    const house = await House.findById(houseId);

    house.users.push(userId);
    house.pices--;

    await house.save();

    return house;
}

async function editHouse(Id, Data) {
    const house = await House.findById(Id);
    
    house.name = Data.name;
    house.type = Data.type;
    house.imageUrl = Data.imageUrl;
    house.year = Number(Data.year);
    house.city = Data.city;
    house.description= Data.description;
    house.pieces= Number(Data.pieces);

    await house.save();

    return house;
}

async function deleteH(id) {
    return HOuse.findByIdAndDelete(id);
}

module.exports = {
    getAllHouses,
    createHouse,
    getOneHouse,
    rent,
    editHouse,
    deleteH
};