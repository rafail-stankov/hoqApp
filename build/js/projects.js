window.onload = function() {

  // get data
  var data = getRequest('https://requirements-bazaar.org/bazaar/projects?per_page=15');
  // append
  for(d of data){
    var creationDate = new Date(d.creationDate);
    var lastUpdatedDate = new Date(d.lastUpdatedDate);
    var shortDescription = d.description;
    var limit = 100;
    if(d.description.length > limit){
      shortDescription = d.description.substring(0, limit);
      for(var i = limit - 1; i > 50; i--){
        if(shortDescription[i] == " "){
          shortDescription = shortDescription.substring(0, i);
          break;
        }
        shortDescription = shortDescription.substring(0, i);
      }
      shortDescription = shortDescription.concat("..");
    }
    element = document.createElement("tr");
    document.getElementById("projectsTable").children[0].appendChild(element);
    element.innerHTML = "<td><a href='https://requirements-bazaar.org/projects/" + d.id + "' target='_blank'>" + d.name + "</a></td><td title='" + d.description + "'>" + shortDescription + "</td><td>" + d.numberOfCategories + "</td><td>" + creationDate.getDate() + "/" + creationDate.getMonth() + "/" + creationDate.getFullYear() + "</td><td>" + lastUpdatedDate.getDate() + "/" + lastUpdatedDate.getMonth() + "/" + lastUpdatedDate.getFullYear() + "</td><td>" + d.numberOfFollowers + "</td><td>" + d.isFollower + "</td><td><a href='/categories?projectId=" + d.id + "'>To Categories</a></td>";
  }

}

function getRequest(url) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", url, false ); // false for synchronous request
  xmlHttp.send( null );
  return JSON.parse(xmlHttp.responseText);
}
