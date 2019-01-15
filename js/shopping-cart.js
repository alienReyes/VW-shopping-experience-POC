$(document).ready(function() {
  $(".js-shopping-cart").click(function() {
    $(".c-shoping-cart").toggleClass("is-open");
  });
});

Vue.component("cart-item", {
  props: ["item"],
  template: "#productTemplate",
  data: function() {
    return {
      quantity: 0,
      unitPrice: this.item.price,
      subTotal: 0
    };
  },
  methods: {
    incQ() {
      this.quantity++;
      this.updateSubTotal("add");
    },
    decQ() {
      if (this.quantity >= 1) {
        this.quantity--;
        this.updateSubTotal("substract");
      }
    },
    updateSubTotal(flag) {
      this.subTotal = this.unitPrice * this.quantity;
      if (this.quantity == 0) {
        this.subTotal = this.unitPrice;
        flag = "substract";
      }
      this.$emit("updateprice", this.subTotal, flag);
    }
  }
});

new Vue({
  el: "#vue-cart",
  data: {
    totalPrice: 0,
    products: [
      {
        id: 0,
        name: "Vectorworks Architect 2019",
        price: 1600,
        picture: "https://placeimg.com/80/80/any"
      },
      {
        id: 2,
        name: "Vectorworks Landscape 2019 ",
        price: 1700,
        picture: "https://placeimg.com/80/80/any"
      },
      {
        id: 3,
        name: "Vectorworks Spotlight 2019",
        price: 150,
        picture: "https://placeimg.com/80/80/any"
      }
    ]
  },
  methods: {
    updatetotal($event, subprice, flag) {
      if (flag === "add") {
        this.totalPrice = this.totalPrice + subprice;
      } else {
        this.totalPrice = this.totalPrice - subprice;
      }
    }
  }
});
