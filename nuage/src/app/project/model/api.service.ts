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

	public getFiles() :Observable<FileDrive>{
		console.log("Reaching "+this.nuageUrl+"listFiles/");
		return this.http.get(this.nuageUrl+"listFiles/")
                  .map(this.extractJson)
                  .catch(this.handleError);
	}

	public getSpaceUsage(){
		console.log("Reaching "+this.nuageUrl+"spaceUsage/");
		return this.http.get(this.nuageUrl+"spaceUsage/")
                  .map(this.extractJson)
                  .catch(this.handleError);
	}

	public getAccountInfos(){
		console.log("Reaching "+this.nuageUrl+"accountInfos/");
		return this.http.get(this.nuageUrl+"accountInfos/")
                  .map(this.extractJson)
                  .catch(this.handleError);
	}

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
			//url = url.replace(/ /g,"+");
			console.log("Reaching "+url);
			requests[i]=this.http.get(url)
	                  .map(this.snackbarMsg)
	                  .catch(this.handleError);
		}
		return Observable.forkJoin(requests);
	}


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
	 * to = <GoogleDrive | Dropbox>
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
	 * to = <GoogleDrive | Dropbox>
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

	private extractJson(res: Response) {
		console.log("Response retrieved");
    	let theFiles  = res.json();
    	return theFiles;
	}

	// private extractJsonFiles(res: Response) {
	// 	console.log("Response retrieved");
	// 	let theFiles  = res.json();
	// 	let root:FileDrive = new FileDrive("Root",new Array<FileDrive>(),"folder",0, null); //We always start the app from the root
	// 	this.addFilesToArray2(root,theFiles);
	// 	return root;
	// }

	// private addFilesToArray2(parent:FileDrive, files){
	// 	for(let file of files){
	// 		//Create all the childrens from the json Documents
	// 		var fd = new FileDrive(file.name,new Array<FileDrive>(), file.type, file.size, file.sources);
	// 		// Going further into files tree
	// 		if(file.children){
	// 			this.addFilesToArray2(fd, file.children); //Pass only the json's children part
	// 		}
	// 		//Add the childrens to the parent
	// 		parent.childrens.push(fd);
	// 	}
 // 	}

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

  	private handleError (error: Response | any) {
  		console.log("ERROR\n");
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
