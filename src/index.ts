// *document connections
const myDisplayArea = document.getElementById("display-area") as HTMLElement;
const mySearchButton = document.querySelector(".search-button") as HTMLButtonElement;
const mySearchInput = document.querySelector(".search-input") as HTMLInputElement;
const myDisplayChartsArea = document.querySelector(".chartsDisplay") as HTMLElement;

// *define parameters
let allCoinsArray: any[] = [];
let coinsDataFromStorage: string = ``;
let allCoinsArrayFromStorage: any[] = [];
let coinMoreInfoData: Record<string, any> = {};

let selectedCoins: string[] = [];
const maxSelections = 5;

mySearchButton.addEventListener("click", function () {
  filterCards(mySearchInput.value);
});

// *main async function when loading page
document.addEventListener("DOMContentLoaded", async function () {
  allCoinsArray = getCoinsDataFromStorage("allCoins");

  if (!allCoinsArray || !allCoinsArray.length) {
    allCoinsArray = await getAllCoinsData();
    keepCoinDataLocalStorage("allCoins", allCoinsArray);
  }

  createCoinCard(allCoinsArray, myDisplayArea);
});

// *function to save to local storage and one to retrieve
function keepCoinDataLocalStorage(arrayName: string, array: any[]) {
  const myCoinsToString = JSON.stringify(array);
  localStorage.setItem(arrayName, myCoinsToString);
}

function getCoinsDataFromStorage(arrayName: string): any[] {
  coinsDataFromStorage = localStorage.getItem(arrayName) || '';
  let coinDataBack: any[] = [];
  if (coinsDataFromStorage) {
    coinDataBack = JSON.parse(coinsDataFromStorage);
  }
  return coinDataBack;
}

// *function to create a coin card and button
function createCoinCard(coinArray: any[], parameter: HTMLElement) {
  coinArray.forEach((obj) => {
    let divDisplay = document.createElement("div");
    divDisplay.classList.add("card");
    let divDisplayBody = document.createElement("div");
    divDisplayBody.classList.add("card-body");

    for (const key in obj) {
      if (key !== "id") {
        const coinData = document.createElement("li");
        coinData.innerText = `${key}: ${obj[key]}`;
        coinData.classList.add("card-text");
        divDisplayBody.appendChild(coinData);
      }
      divDisplay.appendChild(divDisplayBody);
    }

    let index = obj.id;

    const moreInfoButton = createButton(index, divDisplay);
    moreInfoButton.addEventListener("click", async function () {
      const coinMoreInfoData = await getMoreCoinInfo(index);
      displayMoreInfoCoin(coinMoreInfoData, divDisplayBody, moreInfoButton);
      moreInfoButton.style.display = "none";
    });

    let isSelected = false;

    const selectButtonDiv = createSelectButton(index, divDisplay);
    selectButtonDiv.addEventListener("click", function () {
      isSelected = !isSelected;

      if (isSelected) {
        if (selectedCoins.length >= maxSelections) {
          isSelected = false;
          alert("No more selections allowed. " + maxSelections + " coins.");
        } else {
          selectedCoins.push(index);
          alert("selected " + index);
        }
      } else {
        const coinIndex = selectedCoins.indexOf(index);
        if (coinIndex > -1) {
          selectedCoins.splice(coinIndex, 1);
        }
        alert("not selected");
      }
      console.log(selectedCoins);

      if (selectedCoins.length === maxSelections) {
        displaySelectedCoins(selectedCoins);
      }
    });

    parameter.appendChild(divDisplay);
  });
}

// Function to display selected coins in the modal
function displaySelectedCoins(coins: string[]) {
  const selectedCoinsList = document.getElementById('selectedCoinsList') as HTMLElement;

  const list = document.createElement('ul');
  selectedCoinsList.innerHTML = "";
  selectedCoinsList.innerHTML = "<h3>Selected Coins:</h3>";

  coins.forEach(coin => {
    const listItem = document.createElement('li');
    listItem.textContent = `Coin ${coin}`;
    const removeButton = document.createElement('button');
    removeButton.textContent = 'X';
    removeButton.classList.add("remove-from-list")
    

    removeButton.addEventListener('click', function () {
      const coinIndex = selectedCoins.indexOf(coin);
      if (coinIndex > -1) {
        selectedCoins.splice(coinIndex, 1);
      }
      displaySelectedCoins(selectedCoins);
    });
    listItem.appendChild(removeButton);
    list.appendChild(listItem);
  });

  selectedCoinsList.appendChild(list);

  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save Selection';
  saveButton.classList.add("save-button");
  saveButton.addEventListener('click', function () {
    promptRetrieveSavedData();
    console.log(selectedCoins);
    keepCoinDataLocalStorage("selectedCoins", selectedCoins);
    alert("Selections saved!");
  });

  const displayCoinsToChartsButton = document.createElement('button');
  displayCoinsToChartsButton.textContent = "Display in charts";
  displayCoinsToChartsButton.classList.add("display-in-chart-button");
  displayCoinsToChartsButton.addEventListener('click', async function () {
    // let selectedCoinsData = await getAllCoinsForCharts(selectedCoins);
    // console.log(selectedCoinsData);
   ;
  });

  selectedCoinsList.appendChild(displayCoinsToChartsButton);
  selectedCoinsList.appendChild(saveButton);

  const modal = document.getElementById("myModal") as HTMLElement;
  modal.style.display = "block";
}

// Handle closing the modal
const span = document.getElementsByClassName("close")[0] as HTMLElement;
span.onclick = function () {
  const modal = document.getElementById("myModal") as HTMLElement;
  modal.style.display = "none";
}

// Close the modal if the user clicks outside of it
window.onclick = function (event) {
  const modal = document.getElementById("myModal") as HTMLElement;
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// *function fetch all coin data+function to fetch one coin more data
async function getAllCoinsData(): Promise<any[]> {
  let response = await fetch("https://api.coingecko.com/api/v3/coins/list");
  let allCoinsData = await response.json();
  return allCoinsData;
}

async function getMoreCoinInfo(coinId: string): Promise<any> {
  let response = await fetch("https://api.coingecko.com/api/v3/coins/" + coinId);
  let coinMoreData = await response.json();
  return coinMoreData;
}

// *function for more info button
function displayMoreInfoCoin(coinObj: any, parameter2: HTMLElement, button: HTMLButtonElement) {
  let divMoreInfoDisplay = document.createElement("div");
  divMoreInfoDisplay.classList.add("card-body");

  for (const key in coinObj) {
    if (key === "market_data") {
      const coinData = document.createElement("p");
      coinData.innerHTML = coinObj[key].current_price.usd + "$";
      divMoreInfoDisplay.appendChild(coinData);
      const coinDataEur = document.createElement("p");
      coinDataEur.innerHTML = coinObj[key].current_price.eur + "€";
      divMoreInfoDisplay.appendChild(coinDataEur);
      const coinDataIls = document.createElement("p");
      coinDataIls.innerHTML = coinObj[key].current_price.ils + "₪";
      divMoreInfoDisplay.appendChild(coinDataIls);
    } else if (key === "image") {
      const coinImage = document.createElement("img");
      coinImage.classList.add("card-img-top");
      coinImage.src = coinObj[key].large;
      divMoreInfoDisplay.appendChild(coinImage);
    }
  }

  const deleteButton = createDeleteButton(divMoreInfoDisplay);
  deleteButton.addEventListener("click", function () {
    divMoreInfoDisplay.remove();
    deleteButton.remove();
    button.style.display = "block";
  });

  parameter2.appendChild(divMoreInfoDisplay);
}

function filterCards(searchQuery: string) {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    const cardContent = card.textContent?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();

    if (cardContent.includes(query)) {
      (card as HTMLElement).style.display = "block";
    } else {
      (card as HTMLElement).style.display = "none";
    }
  });
}

function createButton(objData: string, divDisplayData: HTMLElement): HTMLButtonElement {
  const moreInfoButtonData = document.createElement("button");
  moreInfoButtonData.classList.add("more-info-btn", "btn", "btn-primary");
  let index = objData;
  moreInfoButtonData.classList.add(index);
  moreInfoButtonData.setAttribute("type", "button");
  moreInfoButtonData.innerHTML = "More Info";
  divDisplayData.appendChild(moreInfoButtonData);
  return moreInfoButtonData;
}

function createSelectButton(objData: string, divDisplayData: HTMLElement): HTMLDivElement {
  const selectButtonDiv = document.createElement("div");
  selectButtonDiv.classList.add("form-check", "form-switch");

  const selectButton = document.createElement("input");
  selectButton.type = "checkbox";
  selectButton.classList.add("form-check-input");
  selectButton.classList.add(objData);
  selectButton.setAttribute("role", "switch");
  selectButton.setAttribute("id", "flexSwitchCheckDefault");

  selectButtonDiv.appendChild(selectButton);
  divDisplayData.appendChild(selectButtonDiv);

  return selectButtonDiv;
}


function createDeleteButton(divMoreInfoDisplay: HTMLElement): HTMLButtonElement {
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("btn", "btn-danger");
  deleteButton.innerHTML = "Less Info";
  divMoreInfoDisplay.appendChild(deleteButton);
  return deleteButton;
}

function promptRetrieveSavedData(): string[] | null {
  const retrieveSavedData = confirm("Would you like to retrieve previously selected data?");
  if (retrieveSavedData) {
    const savedCoins = getCoinsDataFromStorage("selectedCoins") as string[]; // Assuming getCoinsDataFromStorage returns a string array
    if (savedCoins) {
      selectedCoins = savedCoins;
      return selectedCoins; // Update the global array with saved data
    }
  }
  return null;
}





 