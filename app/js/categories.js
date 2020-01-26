window.onload = function() {

  // get data
  console.log(projectId);
  var data = getRequest('https://requirements-bazaar.org/bazaar/projects/'+ projectId + '/categories?per_page=15');
  console.log(data);
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
    var leaderName = "Unassigned";
    if(d.leader.userName != "Unassigned"){
      leaderName = d.leader.firstName + " " + d.leader.lastName;
    }
    element = document.createElement("tr");
    document.getElementById("projectsTable").children[0].appendChild(element);
    element.innerHTML = "<td><a href='https://requirements-bazaar.org/projects/" + d.projectId + "/categories/" + d.id + "' target='_blank'>" + d.name + "</a></td><td title='" + d.description + "'>" + shortDescription + "</td><td>" + creationDate.getDate() + "/" + creationDate.getMonth() + "/" + creationDate.getFullYear() + "</td><td>" + lastUpdatedDate.getDate() + "/" + lastUpdatedDate.getMonth() + "/" + lastUpdatedDate.getFullYear() + "</td><td>" + d.numberOfFollowers + "</td><td>" + d.numberOfRequirements + "</td><td>" + leaderName +"</td><td><a href='/hoq?categoryId=" + d.id + "'>To House of Quality</a></td>";
  }

}

function getRequest(url) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", url, false ); // false for synchronous request
  xmlHttp.send( null );
  return JSON.parse(xmlHttp.responseText);
}
