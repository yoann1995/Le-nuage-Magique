import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class APIService {
	private pokedexUrl = 'http://pokeapi.co/api/v2/pokedex/1'
	private pokemonUrl = 'http://pokeapi.co/api/v2/pokemon/'

	constructor(private http: Http){
	}

	public getPokedex() : Observable<string[]>{
		return this.http.get(this.pokedexUrl)
                  .map(this.extractPokedex)
                  .catch(this.handleError);
	}

	private extractPokedex(res: Response) {
    	let thePoke = res.json();
    	let listPoke:Array<Pokemon> = thePoke.pokemon_entries.map((poke) => {return new Pokemon(poke.entry_number,poke.pokemon_species.name)});
    	return listPoke;
	}

	public getPokemonInfo(id:number){
		return this.http.get(this.pokemonUrl+id)
                  .map(this.extractPokeInfo)
                  .catch(this.handleError);
	}


	private extractPokeInfo(res: Response) {
		let thePoke = res.json();
    	return thePoke;
	}

  	private handleError (error: Response | any) {
	    let errMsg: string;
	    if (error instanceof Response) {
	      const body = error.json() || '';
	      const err = body.error || JSON.stringify(body);
	      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
	    } else {
	      errMsg = error.message ? error.message : error.toString();
	    }
	    console.error(errMsg);
	    return Observable.throw(errMsg);
	}
}