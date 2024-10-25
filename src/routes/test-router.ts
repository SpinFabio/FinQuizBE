import  express  from "express";
import {Pool} from 'mysql2/promise'

export const createTestRouter= (myPool: Pool)=>{
  const router = express.Router();

  router
    .route('/')
    .post((req,res)=>{
      res.json({
        'messaggio': 'ecco qui la risposta alla test post '
      })  
    })
    .get((_,res)=>{
      res.json({ response: {
          'messaggio':'Ricevuto il messaggio dal client!',
          'contenuto':'prototipo del contenuto'
        }
      });
    })

  return router
}
