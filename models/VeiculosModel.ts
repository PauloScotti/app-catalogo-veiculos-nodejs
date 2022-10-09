import mongoose, {Schema} from "mongoose";

const VeiculosSchema = new Schema({
    nome: {type: String, required: true},
    marca: {type: String, required: true},
    modelo : {type: String, required: true},
    valor : {type : Number, default : 0},
    foto: {type: String, required: false},
});

export const VeiculosModel = (mongoose.models.veiculos || 
    mongoose.model('veiculos', VeiculosSchema));