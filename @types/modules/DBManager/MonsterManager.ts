import { FeatureManager } from "./FeatureManager";
import {Monster} from '../../models/Monster'

export default class MonsterManager extends FeatureManager{
    public insert(params: Monster): void {
        
    }
    public read(params: any): void {
        throw new Error("Method not implemented.");
    }
    public update(params: any): void {
        throw new Error("Method not implemented.");
    }
    public delete(params: any): void {
        throw new Error("Method not implemented.");
    }
    
}