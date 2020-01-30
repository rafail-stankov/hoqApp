var houseRoof = [];
var houseBody = [];
var canvas;
var numberOfSpecifications = 0;
var firstSpecification;
var requirements;
var specifications;

window.onload = function() {

  canvas = document.getElementById('canvas');
  getSpecifications(categoryId).then(data => {
    data.json().then(specs => {
      specifications = specs;
      numberOfSpecifications = specifications.length;
      if(specifications.length == 0){
        console.log("no specifications");
      }
      // tech. specifications (columns)
      for(var i = 0; i < specifications.length; i++){
        var specElement = document.createElement('td');
        specElement.className = "specification";
        specElement.id = "ts-" + specifications[i].id;
        specElement.innerHTML = '<p class="sideway"><span><input type="text" placeholder="New Specification.." class="specInput" spellcheck="false" value="' + specifications[i].name + '" /></span></p>';
        document.getElementById('specifications').insertBefore(specElement, document.getElementById('specMarker'));
        var specificationInput = specElement.querySelector(".specInput");
        specificationInput.addEventListener("keyup", onEnterPressed);
        specificationInput.addEventListener("blur", onBlur);
      }
      // customer requirements (rows)
      requirements = getRequest('https://requirements-bazaar.org/bazaar/categories/' + categoryId + '/requirements?per_page=10&state=all');
      requirements.forEach(function(r, p){
        var reqElement = document.createElement('tr');
        reqElement.className = "requirement-row";
        reqElement.id = "cr-" + r.id;
        reqElement.innerHTML = '<td class="customer-requirements">' + r.name + '</td><td id="priority-' + p + '" class="requirement-priorities">' + (r.upVotes - r.downVotes) + '</td>';
        for(var j = 0; j < specifications.length; j++){
          reqElement.innerHTML += '<td class="relationships"></td>';
        }
        document.getElementById('houseTable').children[0].insertBefore(reqElement, document.getElementById('importanceValue'));
        houseBody[p] = new Array(specifications.length);
      });
      // set body to 0
      for(var i = 0; i < data.length; i++){
        for(var j = 0; j < numberOfSpecifications; j++){
          houseBody[i][j] = 0;
        }
      }
      // min/max, importance value, importance weight, targets
      var importanceValueElement = document.getElementById('importanceValue');
      var minMaxElement = document.getElementById('minMax');
      var importanceWeightElement = document.getElementById('importanceWeight');
      minMaxElement.innerHTML = '<td colspan="2" class="hidden"></td><td colspan="2" class="hidden"></td>';
      importanceValueElement.innerHTML = '<td colspan="2" class="hidden"></td><td colspan="2" class="hidden"></td>';
      importanceWeightElement.innerHTML = '<td colspan="2" class="hidden"></td><td colspan="2" class="hidden"></td>';
      for(var i = 0; i < specifications.length; i++){
        var minMaxToAppend = document.createElement('td');
        minMaxToAppend.className = "targets";
        minMaxElement.insertBefore(minMaxToAppend, minMaxElement.lastChild);
        var importanceValueToAppend = document.createElement('td');
        importanceValueToAppend.className = "extra";
        importanceValueToAppend.id = "importanceValue-" + i;
        importanceValueElement.insertBefore(importanceValueToAppend, importanceValueElement.lastChild);
        var importanceWeightToAppend = document.createElement('td');
        importanceWeightToAppend.className = "extra";
        importanceWeightToAppend.id = "importanceWeight-" + i;
        importanceWeightElement.insertBefore(importanceWeightToAppend, importanceWeightElement.lastChild);
      }
      // event listeners
      var relationships = document.getElementsByClassName('relationships');
      for(var i = 0; i < relationships.length; i++){
        relationships[i].addEventListener("click", function(ev){
          var rowIndex = ev.target.parentElement.rowIndex;
          var cellIndex = ev.target.cellIndex;
          changeRelationship(rowIndex - 2, cellIndex - 2, this);
          calculateImportance();
        });
      }
      // add new column
      addNewColumn(true);
      // roof
      firstSpecification = document.getElementsByClassName('specification')[0];
      createCanvas();
    });
  });
  // get data
  var data = getRequest('https://requirements-bazaar.org/bazaar/categories/' + categoryId + '/requirements?per_page=10&state=all');
  document.getElementById("categoryName").innerHTML = getCategoryName(categoryId);
  //var data = getRequest('https://requirements-bazaar.org/activities/?before=-1&after=-1&limit=10&fillChildElements=true');
  var techRequirements = document.getElementsByClassName('tech-requirements');

  // event listeners

  var targets = document.getElementsByClassName('targets');
  for(var i = 0; i < targets.length; i++){
    targets[i].addEventListener("click", function(ev){
      var cellIndex = ev.target.cellIndex;
      changeTarget(cellIndex - 1, this);
    });
  }

  canvas.onmousedown = function(){
    return false;
  };

  canvas.addEventListener('click', function(event) {
      // var viewportOffset = canvas.getBoundingClientRect();
      // var x = event.pageX - viewportOffset.left, y = event.pageY - viewportOffset.top;
      // console.log(x + " " + y);
      var ctx = canvas.getContext('2d');
      var columnWidth = firstSpecification.offsetWidth;
      var x;
      var y;
      if (event.pageX || event.pageY) {
        x = event.pageX;
        y = event.pageY;
      }
      else {
        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
      x -= canvas.offsetLeft;
      y -= canvas.offsetTop;
      console.log(x + " " + y);
      var ctrLeft = 0;
      for(var i = 0; i < numberOfSpecifications + 1; i++){
        if(canvas.width / 2 + x - i * columnWidth > (canvas.height - y)){
          ctrLeft++;
        }
      }
      var ctrRight = 0;
      for(var i = 0; i < numberOfSpecifications + 1; i++){
        if(canvas.width / 2 - x - i * columnWidth > (canvas.height - y)){
          // console.log((canvas.width / 2 - x - i * columnWidth) + " " + (canvas.height - y));
          ctrRight++;
        }
      }
      var ctrRightCoordinate = numberOfSpecifications + 2 - ctrRight;
      console.log(ctrLeft + " " + ctrRightCoordinate);
      if(ctrLeft <= numberOfSpecifications && ctrRightCoordinate <= numberOfSpecifications && ctrLeft >= 1 && ctrRightCoordinate >= 1 && ctrLeft != ctrRightCoordinate){
        ctx.beginPath();
        ctx.arc((canvas.width / 2 - 35 / 2) + columnWidth * (ctrLeft - ctrRight) / 2 + 35 / 2, 5 + columnWidth * (ctrLeft + ctrRight - 2) / 2 + 35 / 2, 15, 0, 2 * Math.PI, false);
        ctx.fill();
        switch(houseRoof[ctrLeft - 1][ctrRightCoordinate - 1]){
          case null:
            houseRoof[ctrLeft - 1][ctrRightCoordinate - 1] = 1;
            houseRoof[ctrRightCoordinate - 1][ctrLeft - 1] = 1;
            var img = new Image();
            img.src = 'images/table/strong-positive.png';
            img.width = '35';
            img.height = '35';
            img.onload = function() {
              ctx.drawImage(img, (canvas.width / 2 - img.width / 2) + columnWidth * (ctrLeft - ctrRight) / 2, 5 + columnWidth * (ctrLeft + ctrRight - 2) / 2, 35, 35);
            };
            break;
          case 1:
            houseRoof[ctrLeft - 1][ctrRightCoordinate - 1] = 2;
            houseRoof[ctrRightCoordinate - 1][ctrLeft - 1] = 2;
            var img = new Image();
            img.src = 'images/table/positive.png';
            img.width = '35';
            img.height = '35';
            img.onload = function() {
              ctx.drawImage(img, (canvas.width / 2 - img.width / 2) + columnWidth * (ctrLeft - ctrRight) / 2, 5 + columnWidth * (ctrLeft + ctrRight - 2) / 2, 35, 35);
            };
            break;
          case 2:
            houseRoof[ctrLeft - 1][ctrRightCoordinate - 1] = 3;
            houseRoof[ctrRightCoordinate - 1][ctrLeft - 1] = 3;
            var img = new Image();
            img.src = 'images/table/negative.png';
            img.width = '35';
            img.height = '35';
            img.onload = function() {
              ctx.drawImage(img, (canvas.width / 2 - img.width / 2) + columnWidth * (ctrLeft - ctrRight) / 2, 5 + columnWidth * (ctrLeft + ctrRight - 2) / 2, 35, 35);
            };
            break;
          case 3:
            houseRoof[ctrLeft - 1][ctrRightCoordinate - 1] = 4;
            houseRoof[ctrRightCoordinate - 1][ctrLeft - 1] = 4;
            var img = new Image();
            img.src = 'images/table/strong-negative.png';
            img.width = '35';
            img.height = '35';
            img.onload = function() {
              ctx.drawImage(img, (canvas.width / 2 - img.width / 2) + columnWidth * (ctrLeft - ctrRight) / 2, 5 + columnWidth * (ctrLeft + ctrRight - 2) / 2, 35, 35);
            };
            break;
          case 4:
            houseRoof[ctrLeft - 1][ctrRightCoordinate - 1] = null;
            houseRoof[ctrRightCoordinate - 1][ctrLeft - 1] = null;
            break;
          default:
            houseRoof[ctrLeft - 1][ctrRightCoordinate - 1] = null;
            houseRoof[ctrRightCoordinate - 1][ctrLeft - 1] = null;
            break;
        }
        return false;
        // console.log(houseRoof);
      }
  }, false);
  // end event listeners

}

function createCanvas(){
  // TODO: KEEP VALUES
  clearCanvas();
  var ctx = canvas.getContext('2d');
  var table = document.getElementById('houseTable');

  var totalWidth = 0;
  for(var i = 0; i < numberOfSpecifications + 1; i++){
    totalWidth += firstSpecification.offsetWidth;
    if(i < numberOfSpecifications){
      houseRoof[i] = new Array(numberOfSpecifications);
    }
  }
  // fill arrays with null
  for(var i = 0; i < numberOfSpecifications; i++){
    for(var j = 0; j < numberOfSpecifications; j++){
      houseRoof[i][j] = null;
    }
  }

  var viewportOffsetTD = firstSpecification.getBoundingClientRect();

  // adjust canvas
  canvas.width = totalWidth;
  canvas.height = totalWidth / 2;
  canvas.style.transform = "translateX(-" + (canvas.offsetLeft - viewportOffsetTD.left) + "px)";

  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(canvas.width / 2, 0);
  ctx.lineTo(0, canvas.height);
  ctx.fillStyle = "#f5f5f5";
  ctx.fill();
  ctx.stroke();

  var columnWidth = firstSpecification.offsetWidth;

  for(var i = 0; i < 10; i++){
    ctx.beginPath();
    ctx.moveTo((i + 1) * columnWidth, canvas.height);
    ctx.lineTo(canvas.width / 2 + (columnWidth / 2) * (i + 1), 0 + (columnWidth / 2) * (i + 1));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width - (i + 1) * columnWidth, canvas.height);
    ctx.lineTo(canvas.width / 2 - (columnWidth / 2) * (i + 1), 0 + (columnWidth / 2) * (i + 1));
    ctx.stroke();
  }

}

function clearCanvas(){
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function addNewColumn(isFirst){
  // select <tr> elements
  var specificationElement = document.getElementById('specifications');
  var minMaxElement = document.getElementById('minMax');
  var requirementRows = document.getElementsByClassName('requirement-row');
  var importanceValueElement = document.getElementById('importanceValue');
  var importanceWeightElement = document.getElementById('importanceWeight');
  // finish previous column
  if(!isFirst){
    var minMaxToAppendOld = document.createElement('td');
    minMaxToAppendOld.className = "targets";
    minMaxElement.insertBefore(minMaxToAppendOld, minMaxElement.lastChild);
    for(var i = 0; i < requirementRows.length; i++){
      var requirementRowToAppendOld = document.createElement('td');
      requirementRowToAppendOld.className = "relationships";
      requirementRows[i].appendChild(requirementRowToAppendOld);
    }
    importanceValueElement.lastChild.previousSibling.removeAttribute('id');
    importanceWeightElement.lastChild.previousSibling.removeAttribute('id');
  }
  specificationElement.lastChild.lastChild
  // add new column
  var specificationToAppend = document.createElement('td');
  specificationToAppend.className = "specification";
  specificationToAppend.innerHTML = `<p class="sideway"><span><input type="text" placeholder="New Specification.." class="specInput" onfocus="this.placeholder=''" onblur="this.placeholder='New Specification..'" spellcheck="false" /></span></p>`;
  specificationElement.insertBefore(specificationToAppend, specificationElement.lastChild);
  var importanceValueToAppend = document.createElement('td');
  importanceValueToAppend.className = "extra";
  importanceValueToAppend.id = "importanceValueTotal";
  importanceValueElement.insertBefore(importanceValueToAppend, importanceValueElement.lastChild);
  var importanceWeightToAppend = document.createElement('td');
  importanceWeightToAppend.id = "importanceWeightTotal";
  importanceWeightElement.insertBefore(importanceWeightToAppend, importanceWeightElement.lastChild);
  importanceWeightToAppend.className = "extra";
  // listeners
  var specificationInput = specificationToAppend.querySelector(".specInput");
  specificationInput.addEventListener("keyup", onEnterPressedNew);
  specificationInput.addEventListener("blur", onBlurNew);
}


function onEnterPressedNew(event){
  if(event.keyCode == 13){
    // TODO:
    if(this.value != ""){
      this.blur();
    }
  }
}

function onBlurNew(event){
  // TODO:
  if(this.value != ""){
    var newId = Math.floor(Math.random() * 1000);
    this.closest('td').id = newId;
    addSpecification({"id": newId, "name": this.value, "categoryId": categoryId});
    addSubSpecification({"id": newId, "name": this.value, "categoryId": categoryId});
    numberOfSpecifications++;
    addNewColumn(false);
    createCanvas();
    this.removeEventListener("keyup", onEnterPressedNew);
    this.removeEventListener("blur", onBlurNew);
    this.addEventListener("keyup", onEnterPressed);
    this.addEventListener("blur", onBlur);
  }
}

function onEnterPressed(event){
  if(event.keyCode == 13){
    this.blur();
  }
}

function onBlur(event){
  if(this.value != ""){
    // save column
    changeSpecification({"id": getIdAfterDash(this.closest('td').id), "name": this.value, "categoryId": categoryId});
  } else {
    deleteColumn(this);
  }
}

function deleteColumn(input){
  if(confirm('Are you sure you want to delete this technical specification?')){
    deleteSpecification({"id": getIdAfterDash(input.closest('td').id), "name": this.value, "categoryId": categoryId});
    deleteSubSpecification({"id": getIdAfterDash(input.closest('td').id), "name": this.value, "categoryId": categoryId});
    var specification = input.closest('td');
    var index = getChildIndex(specification);
    if(specification == firstSpecification){
      firstSpecification = specification.nextSibling;
    }
    specification.remove();
    document.getElementById('minMax').children[index].remove();
    var requirementRows = document.getElementsByClassName('requirement-row');
    Array.from(requirementRows).forEach(row => {
      row.children[index + 1].remove();
    });
    document.getElementById('importanceValue').children[index].remove();
    document.getElementById('importanceWeight').children[index].remove();
    numberOfSpecifications--;
    createCanvas();
    // TODO: DELETE FROM DATABASE
  } else {
    // TODO: OLD VALUE
  }
}

function getCategoryName(categoryId){
  var category = getRequest('https://requirements-bazaar.org/bazaar/categories/'+ categoryId);
  if(category){
    return category.name;
  } else {
    return "There is no category with that id.";
  }
}


// helpers
function changeRelationship(i, j, cell){
  var style = cell.currentStyle || window.getComputedStyle(cell, false),
  src = style.backgroundImage.slice(4, -1).replace(/"/g, ""),
  imageName = /[^/]*$/.exec(src)[0];
  switch(imageName){
    case "":
      cell.style.backgroundImage = "url('images/table/weak.png')";
      houseBody[i][j] = 1;
      break;
    case "weak.png":
      cell.style.backgroundImage = "url('images/table/fair.png')";
      houseBody[i][j] = 2;
      break;
    case "fair.png":
      cell.style.backgroundImage = "url('images/table/strong.png')";
      houseBody[i][j] = 3;
      break;
    case "strong.png":
      cell.style.backgroundImage = 'none';
      houseBody[i][j] = 0;
      break;
    default:
      cell.style.background = 'none';
      houseBody[i][j] = 0;
      break;
  }
}

function changeTarget(j, cell){
  var style = cell.currentStyle || window.getComputedStyle(cell, false),
  src = style.backgroundImage.slice(4, -1).replace(/"/g, ""),
  imageName = /[^/]*$/.exec(src)[0];
  switch(imageName){
    case "":
      cell.style.backgroundImage = "url('images/table/arrow-up.png')";
      // houseBody[i][j] = 1;
      break;
    case "arrow-up.png":
      cell.style.backgroundImage = "url('images/table/arrow-down.png')";
      // houseBody[i][j] = 2;
      break;
    case "arrow-down.png":
      cell.style.backgroundImage = "url('images/table/neutral.png')";
      // houseBody[i][j] = 3;
      break;
    case "neutral.png":
      cell.style.backgroundImage = 'none';
      // houseBody[i][j] = 0;
      break;
    default:
      cell.style.background = 'none';
      // houseBody[i][j] = 0;
      break;
  }
}

function calculateImportance(){
  var totalImportance = 0;
  for(var j = 0; j < houseBody[0].length; j++){
    var importance = 0;
    for(var i = 0; i < houseBody.length; i++){
      var priority = document.getElementById('priority-' + i).textContent;
      var temp = 0;
      switch(houseBody[i][j]){
        case 0:
          break;
        case 1:
          temp = 1;
          break;
        case 2:
          temp = 3;
          break;
        case 3:
          temp = 9;
          break;
        default:
          break;
      }
      importance += temp * priority;
    }
    totalImportance += importance;
    document.getElementById('importanceValue-' + j).textContent = importance;
  }

  for(var j = 0; j < houseBody[0].length; j++){
    var importance = document.getElementById('importanceValue-' + j).textContent;
    document.getElementById('importanceWeight-' + j).textContent = coolRounder(importance * 100 / totalImportance) + "%";
  }

  document.getElementById('importanceValueTotal').textContent = totalImportance;
  document.getElementById('importanceWeightTotal').textContent = "100%";

}

function coolRounder(x){
  return Math.round(x * 100) / 100;
}

function getRequest(url) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", url, false ); // false for synchronous request
  xmlHttp.send( null );
  return JSON.parse(xmlHttp.responseText);
}

function getChildIndex(element){
  var i = 0;
  while((element = element.previousSibling) != null){
    i++;
  }
  return i;
}

function getIdAfterDash(str){
  return str.substring(str.lastIndexOf('/') + 1);
}

// end helpers

// Network functions

function getSpecifications(categoryId) {
  return fetch('api/tech-specifications?categoryId=' + categoryId).then(response => {
    return response;
    if (!response.ok) {
      throw Error(response.statusText);
    }
    respons.json().then(data => {
      return data;
    });
  });
}

function addSpecification(specification){
  const headers = new Headers({'Content-Type': 'application/json'});
  specification.requirements = new Array();
  specification.specifications = new Array();
  // new ts relationships
  for(var i = 0; i < requirements.length; i++){
    specification.requirements.push({"id": requirements[i].id, "value": 0});
  }
  // new ts interrelationships
  for(var i = 0; i < specifications.length; i++){
    specification.specifications.push({"id": specifications[i].id, "value": 0});
  }
  var body = JSON.stringify(specification);
  specifications.push(specification);
  return fetch('api/tech-specifications', {
    method: 'POST',
    headers: headers,
    body: body
  });
}

function addSubSpecification(specification){
  // old tss interrelationships
  console.log(specifications);
  for(var i = 0; i < specifications.length; i++){
    specifications[i].specifications.push({"id": specification.id, "value": 0});
    changeSpecification(specifications[i]);
  }
}

function deleteSubSpecification(specification){
  for(var i = 0; i < specifications.length; i++){
    var index = -1;
    for(var j = 0; j < specifications[i].specifications.length; j++){
      if(specifications[i].specifications[j].id == specification.id){
        index = j;
      }
    }
    if(index > -1){
      specifications[i].specifications.splice(index, 1);
    }
    deleteSpecification(specifications[i]);
    console.log(specifications[i]);
  }
}

function changeSpecification(specification){
  const headers = new Headers({'Content-Type': 'application/json'});
  const body = JSON.stringify(specification);
  return fetch('api/tech-specifications', {
    method: 'PUT',
    headers: headers,
    body: body
  });
}

function deleteSpecification(specification){
  for(var i = 0; i < specifications.length; i++){
    var index = -1;
    if(specifications[i].id = specification.id){
      index = i;
    }
  }
  if(index > -1){
    specifications.splice(index, 1);
  }
  const headers = new Headers({'Content-Type': 'application/json'});
  const body = JSON.stringify(specification);
  return fetch('api/tech-specifications', {
    method: 'DELETE',
    headers: headers,
    body: body
  });
}

function getStuff() {
  return fetch('api/getAll').then(response => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response;
  });
}
