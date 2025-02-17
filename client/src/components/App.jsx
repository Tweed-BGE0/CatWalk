import React from "react";
import ProductsOverview from "./ProductOverview/ProductOverView.jsx";
import QuestionsAnswers from "./QuestionsAnswers/QuestionsAnswers.jsx";
import RatingsReviews from "./RatingsReviews/RatingsReviews.jsx";
import RelatedProducts from "./RelatedProducts/RelatedProducts.jsx";
import FiveStar from "./FiveStar.jsx";
import MenuBar from "./MenuBar.jsx";
import ReturnToTop from "./ReturnToTop.jsx";
import FooterBar from "./FooterBar.jsx";
import ls from "local-storage";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cacheName: "catWalk",
      currentProduct: {},
      currentProductRating: 0,
      currentProductStyles: [],
      currentRelatedProductsIds: [],
      currentRelatedProducts: [],
      currentRelatedProductStyles: [],
      currentRelatedProductRatings: {},
    };

    this.getRelatedProductsIds = this.getRelatedProductsIds.bind(this);
    this.getSingleProductInfo = this.getSingleProductInfo.bind(this);
    this.getAllRelatedProductsInfo = this.getAllRelatedProductsInfo.bind(this);
    this.getProductStyles = this.getProductStyles.bind(this);
    this.getAllRelatedProductsStyles =
      this.getAllRelatedProductsStyles.bind(this);
    this.handleChangeCurrentProduct =
      this.handleChangeCurrentProduct.bind(this);
    this.getRating = this.getRating.bind(this);
    this.getRelatedRatings = this.getRelatedRatings.bind(this);
    //this.recordClicks = this.recordClicks.bind(this);
  }

  //recordClicks(e) {
    // var events = ls.get("logEvents") || [];
    // var clickEvent = {};
    // clickEvent.element = e.target;
    // clickEvent.time = new Date().toString().substring(0, 25);
    // var mod = e.target.closest(".module-parent");
    // var logModule;
    // if (mod !== null) {
    //   var name = mod.className;
    //   if (name.includes("questions")) {
    //     logModule = "Questions and Answers";
    //   } else if (name.includes("related")) {
    //     logModule = "Related Products";
    //   } else if (name.includes("products-overview")) {
    //     logModule = "Product Overview";
    //   } else if (name.includes("ratings")) {
    //     logModule = "Ratings and Reviews";
    //   } else {
    //     logModule = "App container";
    //   }
    // }
    // clickEvent.module = logModule;
    // events.push(clickEvent);
    // ls("logEvents", events);
  //}

  async handleChangeCurrentProduct(id) {
    try {
      let loadProduct = await this.getSingleProductInfo(id);
      this.setState({ currentProduct: loadProduct });
      let loadStyles = await this.getProductStyles(id);
      this.setState({ currentProductStyles: loadStyles });
      var rating = await this.getRating(id);
      this.setState({ currentProductRating: rating });
      await this.getRelatedProductsIds(id);
      this.getAllRelatedProductsStyles(this.state.currentRelatedProductsIds);
      this.getAllRelatedProductsInfo(this.state.currentRelatedProductsIds);
      this.getRelatedRatings(this.state.currentRelatedProductsIds);
    } catch (err) {
      console.log(err);
    }
  }

  async componentDidMount() {
    this.handleChangeCurrentProduct("37311");
  }

  async getRelatedProductsIds(productId) {
    try {
      let response = await fetch(`api/products/${productId}/related`);
      let ids = await response.json();
      for (let i = 0; i < ids.length; i++) {
        if (ids.indexOf(ids[i], i + 1) > 0) {
          ids.splice(i, 1);
        }
      }
      this.setState({ currentRelatedProductsIds: ids });
    } catch (err) {
      console.log(err);
    }
  }

  async getSingleProductInfo(productId) {
    try {
      let response = await fetch(`api/products/${productId}`);
      let productInfo = await response.json();
      return productInfo;
    } catch (err) {
      console.log(err);
    }
  }

  async getAllRelatedProductsInfo(productIds) {
    let products = [];
    productIds.map((id) => {
      let x = this.getSingleProductInfo(id);
      products.push(x);
    });
    let results = await Promise.all(products);
    this.setState({ currentRelatedProducts: results });
  }

  async getProductStyles(productId) {
    try {
      let response = await fetch(`api/products/${productId}/styles`);
      let productStyles = await response.json();
      return productStyles;
    } catch (err) {
      console.log(err);
    }
  }

  async getAllRelatedProductsStyles(productIds) {
    let styles = [];
    productIds.map((id) => {
      let x = this.getProductStyles(id);
      styles.push(x);
    });
    let results = await Promise.all(styles);
    this.setState({ currentRelatedProductStyles: results });
  }

  async getRating(id) {
    try {
      let response = await fetch(`api/reviews?product_id=${id}`);
      let reviews = await response.json();
      reviews = reviews.results;
      if (reviews.length === 0) {
        return 0;
      }
      if (reviews[0].rating === undefined) {
        return 0;
      }
      let rating = reviews[0].rating;
      for (let i = 1; i < reviews.length; i++) {
        rating += reviews[i].rating;
      }
      rating = rating / reviews.length;
      return rating;
    } catch (err) {
      console.log(err);
    }
  }

  async getRelatedRatings(ids) {
    var ratings = {};
    for (let i = 0; i < ids.length; i++) {
      ratings[ids[i]] = await this.getRating(ids[i]);
    }
    for (var key in ratings) {
      if (ratings[key] === undefined) {
        ratings[key] = 0;
      }
    }
    this.setState({ currentRelatedProductRatings: ratings });
  }

  render() {
    return (
      <div onClick={this.recordClicks}>
        <MenuBar />
        <div className="app-container">
          <ProductsOverview
            currentProduct={this.state.currentProduct}
            currentStyles={this.state.currentProductStyles}
            currentRatings={this.state.currentProductRating}
          />

          <RelatedProducts
            relatedratings={this.state.currentRelatedProductRatings}
            currentProduct={this.state.currentProduct}
            currentproductstyles={this.state.currentProductStyles}
            relatedProducts={this.state.currentRelatedProducts}
            relatedProductStyles={this.state.currentRelatedProductStyles}
            relatedProductsIds={this.state.currentRelatedProductsIds}
            changeProducts={this.handleChangeCurrentProduct}
          />
          <h3 id="qa-link" className="reset-margins qa-header ">
            QUESTIONS & ANSWERS
          </h3>

          <QuestionsAnswers currentProduct={this.state.currentProduct} />
          <RatingsReviews currentProduct={this.state.currentProduct} />
        </div>
        <FooterBar />
        <ReturnToTop />
      </div>
    );
  }
}

export default App;
