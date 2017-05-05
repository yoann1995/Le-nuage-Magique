import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { FileDrive } from '../model/FileDrive';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class APIService {
	private nuageUrl = 'http://localhost:8080/'

	constructor(private http: Http){
	}

	/**
	 * Get the json file describing the entire file tree for all cloud
	 */
	public getFiles(){
		console.log("Reaching "+this.nuageUrl+"listFiles/");
		return this.http.get(this.nuageUrl+"listFiles/")
                  .map(this.extractJson)
                  .catch(this.handleError);
	}

	/**
	 * Get the json file describing the space usage for each cloud source
	 */
	public getSpaceUsage(){
		console.log("Reaching "+this.nuageUrl+"spaceUsage/");
		return this.http.get(this.nuageUrl+"spaceUsage/")
                  .map(this.extractJson)
                  .catch(this.handleError);
	}

	/**
	 * Get the json file describing the profil information for each connected cloud
	 */
	public getAccountInfos(){
		console.log("Reaching "+this.nuageUrl+"accountInfos/");
		return this.http.get(this.nuageUrl+"accountInfos/")
                  .map(this.extractJson)
                  .catch(this.handleError);
	}

	/**
	 * Call the server to delete the specified file
	 * Get a json file containing the server response (fail or success)
	 * @param file The file to remove
	 */
	public removeFile(file:FileDrive){
		let requests:any[] = new Array();
		// Remove the file on all its sources
		for(let i=0;i<file.sources.length;i++){
			let url:string = this.nuageUrl;
			let src = file.sources[i];
			console.log("DELETE:"+src.name);
			if(src.name === "GoogleDrive"){
				url += "delete/GoogleDrive?id="+src.id;
			} else if (src.name === "Dropbox" ){
				url += "delete/Dropbox?path="+src.id;
			}
			console.log("Reaching "+url);
			requests[i]=this.http.get(url)
	                  .map(this.snackbarMsg)
	                  .catch(this.handleError);
		}
		return Observable.forkJoin(requests);
	}

	/**
	 * Call the server to rename the specified file
	 * Get a json file containing the server response (fail or success)
	 * @param file The file to rename
	 * @param newName The new file name
	 */
	public rename(file:FileDrive, newName:string){
		let requests:any[] = new Array();
		for(let i=0;i<file.sources.length;i++){
			let url:string = this.nuageUrl;
			let src = file.sources[i];
			if(src.name === "GoogleDrive"){
				url += "rename/GoogleDrive?id="+src.id+"&name="+newName;
			} else if (src.name === "Dropbox" ){
				url += "rename/Dropbox?path="+src.id+"&name="+newName;
			}
			requests[i]=this.http.get(url)
	                  .map(this.snackbarMsg)
	                  .catch(this.handleError);
		}
		return Observable.forkJoin(requests);
	}

	/**
	 * Call the server to move a file to another folder
	 * Get a json file containing the server response (fail or success)
	 * @param file The file to rename
	 * @param path The path to the new folder
	 */
	public moveFile(file:FileDrive, path:string){
		let requests:any[] = new Array();
		for(let i=0;i<file.sources.length;i++){
			let url:string = this.nuageUrl;
			let src = file.sources[i];
			if(src.name === "GoogleDrive"){
				url += "move/GoogleDrive?from_path="+src.id+"&to_path="+path;
			} else if (src.name === "Dropbox" ){
				url += "move/Dropbox?from_path="+src.id+"&to_path="+path;
			}

			console.log("Reaching "+url);
			requests[i]=this.http.get(url)
	                  .map(this.snackbarMsg)
	                  .catch(this.handleError);
		}
		return Observable.forkJoin(requests);
	}

	/**
	 * Send the specified file to the server
	 * Get a json file containing the server response (fail or success)
	 * @param file The file to rename
	 * @param to The targeted cloud (GoogleDrive or Dropbox)
	 */
	public uploadFile(fileToUplad:File, to:string){
		let formData:FormData = new FormData();
	    formData.append('uploadFile', fileToUplad, fileToUplad.name);
	    let headers:Headers = new Headers();
	    headers.append('Content-Type', 'multipart/form-data');
	    headers.append('Accept', 'application/json');
	    let options:RequestOptions = new RequestOptions(headers);

		return this.http.post("http://localhost:8080/upload/"+to, formData, options)
            .map(this.snackbarMsg)
            .catch(this.handleError)
	}

	/**
	 * Tell the server to create an empty folder
	 * Get a json file containing the server response (fail or success)
	 * @param path The path of the new folder
	 * @param to The targeted cloud (GoogleDrive or Dropbox)
	 * @param idparent The parent file's id to indicate where to create the folder
	 */
	public newFolder(path:string, to:string, idparent:string){
		let url:string = this.nuageUrl;
		if(to=="GoogleDrive"){
			url += "addNewFolder/"+to+"?name="+path+"&idparent="+idparent;
		}
		else{
			url += "addNewFolder/"+to+"?path="+path;
		}
		console.log("Reaching "+url);
		return this.http.get(url)
                  .map(this.snackbarMsg)
                  .catch(this.handleError);
	}

	/* UTILS */

	/**
	 * Get a JSON answer from server
	 */
	private extractJson(res: Response) {
		console.log("Response retrieved");
    	let theFiles  = res.json();
    	return theFiles;
	}

	/**
	 * Get a JSON answer from server describing the error or the success of the request
	 * Display a response toast on the client with the retrieved message
	 */
	private snackbarMsg(res: Response) {
		let msg  = res.json();
		console.log("MESSAGE:"+msg.message);
		let snackBar = document.getElementById("snackbar");
		let snackMsg = document.getElementById("snackbarMsg");
		let snackImg = document.getElementById("snackbarImg");

      	// Add the "show" class to DIV
      	snackBar.className = "show";
      	snackImg.className = msg.result;
      	snackMsg.innerHTML = msg.message;

     	 // After 3 seconds, remove the show class from DIV
      	setTimeout(function(){ snackBar.className = snackBar.className.replace("show", ""); }, 3000);
	}

	/**
	 * Print an error when the request failed
	 */
  	private handleError (error: Response | any) {
  		console.log("ERROR!\n");
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
