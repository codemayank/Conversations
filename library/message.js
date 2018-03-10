//remove msgtype
let generateMessage = (from, to, text, msgtype) =>{
  return{
    from,
    to,
    text,
    msgtype,
    createdAt : new Date().getTime()
  };
}

module.exports = {generateMessage};
