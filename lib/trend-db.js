const {Pool}=require("pg");

let pool;

function getTrendDb(){
  if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for trend history");
  if(!pool){
    pool=new Pool({
      connectionString:process.env.DATABASE_URL,
      ssl:process.env.NODE_ENV==="production"?{rejectUnauthorized:false}:undefined,
      max:5
    });
  }
  return pool;
}

module.exports={getTrendDb};
