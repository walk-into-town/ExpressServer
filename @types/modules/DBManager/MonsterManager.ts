import { FeatureManager, ReadType } from "./FeatureManager";
import {Monster} from '../../models/Monster'

export class MonsterManager extends FeatureManager{
    public insert(params: Monster): void {
        
    }
    public read(params: any, readType: ReadType): void {
        throw new Error("Method not implemented.");
    }
    public update(params: any): void {
        throw new Error("Method not implemented.");
    }
    public delete(params: any): void {
        throw new Error("Method not implemented.");
    }
    
}