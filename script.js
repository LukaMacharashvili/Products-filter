class ApiWorker {
    productApiUrl;
    categoryApiUrl;
    filterCategoriesUrl;
    constructor() {
        this.productApiUrl = "https://europroductcms.azurewebsites.net/api/fetchProducysStepByStep/0/300"
        this.filterCategoriesUrl = "https://europroductcms.azurewebsites.net/api/FetchFilteredProductsStepByStep"
        this.categoryApiUrl = "https://europroductcms.azurewebsites.net/api/productcategory"
    }
    readAllProducts(resultCheckFunction) {
        let http = new XMLHttpRequest();
        http.open("GET", this.productApiUrl);
        http.onloadstart = function() {
            Loader.makeLoaderVisible();
        }
        http.onloadend = function() {
            Loader.makeLoaderInvisible();
            let response = http.response;
            response = JSON.parse(response)
            resultCheckFunction(response)
            console.log(response)
        }
        http.send()
    }
    readAllCategory(resultCheckFunction) {
        let http = new XMLHttpRequest();
        http.open("GET", this.categoryApiUrl);
        http.onloadend = function() {
            let response = http.response;
            response = JSON.parse(response)
            resultCheckFunction(response)
            console.log(response)
        }
        http.send()
    }
    filterProducts(filter, resultCheckFunction) {
        let http = new XMLHttpRequest();
        http.open("POST", this.filterCategoriesUrl);
        http.setRequestHeader("content-type", "application/json");
        http.onloadstart = function() {
            Loader.makeLoaderVisible();
        }
        http.onloadend = function() {
            Loader.makeLoaderInvisible()
            let result = http.response;
            resultCheckFunction(JSON.parse(result))
        }
        console.log(JSON.stringify(filter))
        http.send(JSON.stringify(filter));
    }
}
class Loader {
    static makeLoaderVisible() {
        document.querySelector(".text-dark").style.display = "block";
    }
    static makeLoaderInvisible() {
        document.querySelector(".text-dark").style.display = "none";
    }
}
class HtmlWorker {
    apiWorker;
    filterElements;
    constructor(apiWorker) {
        this.apiWorker = apiWorker;
        this.filterElements = {
            "StartedIndex": 31,
            "ProductCount": 10000031,
            "CategoryIds": []
        }
        this.initData()
    }
    initData() {
        let self = this;
        this.apiWorker.readAllCategory(function(response) {
            self.generateCategoriesOnArea(response)
        })
        this.apiWorker.readAllProducts(function(response) {
            self.generateProductsOnArea(response)
        })
    }
    generateCategoryHtml(category) {
        return `
            <li class="list-group-item">
                <img src="${category.ImageUrl}" alt="">
                <span onclick="htmlWorker.filterProductsOnArea(this,${category.Id})">${category.Name}</span>
            </li>
        `
    }

    generateNewProductCard(product) {
        return `
        <div class="card" style="width: 16rem;">
        <img class="card-img-top" src="${product.MainImageUrl}" alt="Card image cap">
        <div class="card-body">
            <h5 class="card-title">${product.Name}</h5>
            <p class="card-text">${product.ProductCategory.Name}</p>
        </div>
        </div>`
    }
    generateProductsOnArea(products) {
        let self = this;
        let cardsArea = document.querySelector(".cards-area");
        cardsArea.innerHTML = "";
        products.forEach(product => {
            cardsArea.innerHTML += self.generateNewProductCard(product);
        });
    }
    generateCategoriesOnArea(categories) {
        let self = this;
        let categoryArea = document.querySelector(".categories-list");
        categoryArea.innerHTML = "";
        categories.forEach(category => {
            categoryArea.innerHTML += self.generateCategoryHtml(category);
        });
    }
    filterProductsOnArea(item, id) {
        let self = this;
        if (item.parentNode.classList.contains("checked") == false) {
            item.parentNode.classList.add("checked")
            self.filterElements.CategoryIds.push(id)
        } else {
            item.parentNode.classList.remove("checked")
            let idIndex = self.filterElements.CategoryIds.indexOf(id);
            self.filterElements.CategoryIds.splice(idIndex, 1)
        }
        this.apiWorker.filterProducts(this.filterElements, function(parsedHtml) {
            console.log(parsedHtml)
            if (self.filterElements.CategoryIds.length != 0) {
                self.generateProductsOnArea(parsedHtml)
            } else {
                self.apiWorker.readAllProducts(function(response) {
                    self.generateProductsOnArea(response)
                })
            }
        })
    }
}

let htmlWorker = new HtmlWorker(new ApiWorker);