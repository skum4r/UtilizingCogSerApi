
//CogService App Class
var CogServiceApp = function(){
	
	//CogService Api Class
	var CogServiceApi = function() {
       //base url 
       this.baseUrl = "https://westus.api.cognitive.microsoft.com/vision/v1.0/analyze";
      
      //build url
      this.buildUrl = function(params){	
	      	params = params ||  {
				"visualFeatures": "Description,Faces",
				"language": "en",
			};
		 return this.baseUrl+"?"+$.param(params);
	  };
	  
	  //api call
      this.call = function(type,url,data,callback){	
			$.ajax({
				url: url,
				beforeSend: function(xhr){
					// Request headers
					xhr.setRequestHeader("Content-Type","application/octet-stream");
					xhr.setRequestHeader("Ocp-Apim-Subscription-Key",'a3f83569239841febb054651939a5cbe ');
				},
				type: type,
				processData: false,
				data: data,
			})
			.done(function(data) {
				callback.success(data);
			})
			.fail(function(xhr) {
				callback.error(xhr.responseText);
			});
		};
  };
  
  //Api
  this.Api = null;
  
  //initialize
  this.init = function(){
	 //require FileReader Api supported browser
	 if(!FileReader){
		 console.log("app initiation failed : Unsupported Browser");
		 return false;		
	 }
	this.Api = new CogServiceApi();
	 //set image container on file change
	var self = this;
	//call vision api
	this.callVisionApi();
	//call api on file upload
	$('#imgUpload').change(function(){
		var files = this.files;
		 if (FileReader && files && files.length) {
			var fileImage = new FileReader();
			fileImage.onload = function () {
				self.setImgSrc(fileImage.result);
			}
			fileImage.readAsDataURL(files[0]);
		}
	});
	console.log("app initiated successfully.");
	return true;
  };
  
  this.setImgSrc = function(imgSrc){
	$('.img-container img').attr('src',imgSrc);
	this.callVisionApi(imgSrc);
  };
  
  //call vision Api
  this.callVisionApi = function(ImgData){
	  var self = this;
	  var Uri = this.Api.buildUrl();
	  if(ImgData == undefined){
			ImgData = $('.img-container img').attr('src');		  
	  }
	  var Callbacks = {
			success:function(result){
				self.setResult(result);
			},
			error:function(error){
			  error = $.parseJSON(error);
			  console.log('Internal Server Error.');
			  output = "<h3>Error :</h3>";
			  output += "<p>"+error.message+"</p>";
			  $('.api-result').html(output);
			}
		  };
	  
	  $('.api-result').html("processing...");
	  this.Api.call('POST',Uri,this.dataURItoBlob(ImgData),Callbacks);
  };
  
  this.setResult = function(result){
		var output = "";
		if(result.description != undefined && result.description.captions[0] !=undefined){
			output = "<h3>Description :</h3>";
			output += "<p>"+result.description.captions[0].text+"</p>";			  
		}
		if(result.faces != undefined && result.faces[0] != undefined){
			output += "<h3>Face details :</h3>";
			output += "<p> Age :"+result.faces[0].age+"</p>";
			output += "<p> Gender :"+result.faces[0].gender+"</p>";			
		}
	  $('.api-result').html(output);
  };
  
  //convert from base64 to binary
  this.dataURItoBlob = function(dataURI) {
	 // console.log(dataURI);
		// convert base64 to raw binary data held in a string
		// doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
		var byteString = atob(dataURI.split(',')[1]);

		// separate out the mime component
		var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

		// write the bytes of the string to an ArrayBuffer
		var ab = new ArrayBuffer(byteString.length);
		var ia = new Uint8Array(ab);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		// write the ArrayBuffer to a blob, and you're done
		var bb = new Blob([ab], {type: mimeString});
		return bb;
	};
};

$(document).ready(function(){
	var app = new CogServiceApp();
	if(!app.init()){
		alert("unsupported browser.");
	}
});
