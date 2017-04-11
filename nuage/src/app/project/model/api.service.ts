import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class APIService {
	private nuageUrl = 'localhost:8080/'

	constructor(private http: Http){
	}

	public getFiles(){
		return this.http.get(this.nuageUrl+"listFiles")
                  .map(this.extract)
                  .catch(this.handleError);
	}

	private extract(res: Response) {
		console.log("Files retrieved");
    	let theFiles = res.json();
    	//let listPoke:Array<Pokemon> = thePoke.pokemon_entries.map((poke) => {return new Pokemon(poke.entry_number,poke.pokemon_species.name)});
    	console.log(theFiles);
    	return theFiles;
	}

  	private handleError (error: Response | any) {
  		console.log("ERROR");
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