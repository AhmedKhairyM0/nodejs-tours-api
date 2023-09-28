
const data = req.body;
Object.keys(data).forEach(el => {
    if(!allowed.includes(data[el])) delete data[el];
});
