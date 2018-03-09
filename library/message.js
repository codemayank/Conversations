let generateMessage = (from, to, text, type) =>{
  return{
    from,
    to,
    type,
    text,
    createdAt : new Date().getTime()
  };
}

module.exports = {generateMessage};
