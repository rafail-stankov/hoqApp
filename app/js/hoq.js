var houseRoof = [];
var houseBody = [];

window.onload = function() {

  // get data
  var data = getRequest('https://requirements-bazaar.org/bazaar/categories/' + categoryId + '/requirements?per_page=10&state=all');
  //var data = getRequest('https://requirements-bazaar.org/activities/?before=-1&after=-1&limit=10&fillChildElements=true');
  console.log(data);
  var techRequirements = document.getElementsByClassName('tech-requirements');

  // add rows in table
  data.forEach(function(d, i){
    var element = document.createElement('tr');
    element.innerHTML = '<td class="customer-requirements">' + d.name + '</td><td id="priority-' + i + '" class="requirement-priorities">' + (d.upVotes - d.downVotes) + '</td><td class="relationships"></td><td class="relationships"></td><td class="relationships"></td><td class="relationships"></td><td class="relationships"></td><td class="relationships"></td><td class="relationships"></td><td class="relationships"></td><td class="relationships"></td><td class="relationships"></td><td class="extra"></td><td class="extra"></td>';
    // console.log(document.getElementById('houseTable').children[0]);
    document.getElementById('houseTable').children[0].insertBefore(element, document.getElementById('bottomMarker'));
    houseBody[i] = new Array(techRequirements.length);
  });

  // canvas (triangle)
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var table = document.getElementById('houseTable');

  var totalWidth = 0;
  for(var i = 0; i < techRequirements.length; i++){
    totalWidth += techRequirements[i].offsetWidth;
    houseRoof[i] = new Array(techRequirements.length);
  }
  // fill arrays with null
  for(var i = 0; i < techRequirements.length; i++){
    for(var j = 0; j < techRequirements.length; j++){
      houseRoof[i][j] = null;
    }
  }

  for(var i = 0; i < data.length; i++){
    for(var j = 0; j < techRequirements.length; j++){
      houseBody[i][j] = 0;
    }
  }

  var viewportOffsetTD = techRequirements[0].getBoundingClientRect();

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

  var columnWidth = techRequirements[0].offsetWidth;

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

  // end canvas

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

  var targets = document.getElementsByClassName('targets');
  for(var i = 0; i < targets.length; i++){
    targets[i].addEventListener("click", function(ev){
      var cellIndex = ev.target.cellIndex;
      changeTarget(cellIndex - 1, this);
    });
  }

  canvas.addEventListener('click', function(event) {
      // var viewportOffset = canvas.getBoundingClientRect();
      // var x = event.pageX - viewportOffset.left, y = event.pageY - viewportOffset.top;
      // console.log(x + " " + y);
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
      x += 95;
      console.log(x + " " + y);
      var ctrLeft = 0;
      for(var i = 0; i < techRequirements.length; i++){
        // console.log("" + x - i * columnWidth + " " + canvas.height - y);
        console.log(x - i * columnWidth);
        console.log(canvas.height - y);
        if(canvas.width / 2 + x - i * columnWidth > (canvas.height - y)){
          ctrLeft++;
        }
      }
      var ctrRight = 0;
      for(var i = 0; i < techRequirements.length; i++){
        if(canvas.width / 2 - x - i * columnWidth > (canvas.height - y)){
          ctrRight++;
        }
      }
      console.log(ctrLeft + " " + ctrRight);
      if(ctrLeft + ctrRight <= 10 && ctrLeft >= 1 && ctrRight >= 1){
        ctx.beginPath();
        ctx.arc((canvas.width / 2 - 35 / 2) + columnWidth * (ctrLeft - ctrRight) / 2 + 35 / 2, 5 + columnWidth * (ctrLeft + ctrRight - 2) / 2 + 35 / 2, 15, 0, 2 * Math.PI, false);
        ctx.fill();
        switch(houseRoof[ctrLeft - 1][ctrRight - 1]){
          case null:
            houseRoof[ctrLeft - 1][ctrRight - 1] = 1;
            houseRoof[ctrRight - 1][ctrLeft - 1] = 1;
            var img = new Image();
            img.src = 'images/table/strong-positive.png';
            img.width = '35';
            img.height = '35';
            img.onload = function() {
              ctx.drawImage(img, (canvas.width / 2 - img.width / 2) + columnWidth * (ctrLeft - ctrRight) / 2, 5 + columnWidth * (ctrLeft + ctrRight - 2) / 2, 35, 35);
            };
            break;
          case 1:
            houseRoof[ctrLeft - 1][ctrRight - 1] = 2;
            houseRoof[ctrRight - 1][ctrLeft - 1] = 2;
            var img = new Image();
            img.src = 'images/table/positive.png';
            img.width = '35';
            img.height = '35';
            img.onload = function() {
              ctx.drawImage(img, (canvas.width / 2 - img.width / 2) + columnWidth * (ctrLeft - ctrRight) / 2, 5 + columnWidth * (ctrLeft + ctrRight - 2) / 2, 35, 35);
            };
            break;
          case 2:
            houseRoof[ctrLeft - 1][ctrRight - 1] = 3;
            houseRoof[ctrRight - 1][ctrLeft - 1] = 3;
            var img = new Image();
            img.src = 'images/table/negative.png';
            img.width = '35';
            img.height = '35';
            img.onload = function() {
              ctx.drawImage(img, (canvas.width / 2 - img.width / 2) + columnWidth * (ctrLeft - ctrRight) / 2, 5 + columnWidth * (ctrLeft + ctrRight - 2) / 2, 35, 35);
            };
            break;
          case 3:
            houseRoof[ctrLeft - 1][ctrRight - 1] = 4;
            houseRoof[ctrRight - 1][ctrLeft - 1] = 4;
            var img = new Image();
            img.src = 'images/table/strong-negative.png';
            img.width = '35';
            img.height = '35';
            img.onload = function() {
              ctx.drawImage(img, (canvas.width / 2 - img.width / 2) + columnWidth * (ctrLeft - ctrRight) / 2, 5 + columnWidth * (ctrLeft + ctrRight - 2) / 2, 35, 35);
            };
            break;
          case 4:
            houseRoof[ctrLeft - 1][ctrRight - 1] = null;
            houseRoof[ctrRight - 1][ctrLeft - 1] = null;
            break;
          default:
            houseRoof[ctrLeft - 1][ctrRight - 1] = null;
            houseRoof[ctrRight - 1][ctrLeft - 1] = null;
            break;
        }
        console.log(houseRoof);
      }
  }, false);
  // end event listeners

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
    document.getElementById('importance-' + j).textContent = importance;
  }

  for(var j = 0; j < houseBody[0].length; j++){
    var importance = document.getElementById('importance-' + j).textContent;
    document.getElementById('importanceWeight-' + j).textContent = coolRounder(importance * 100 / totalImportance) + "%";
  }

  document.getElementById('importanceTotal').textContent = totalImportance;
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
// end helpers
