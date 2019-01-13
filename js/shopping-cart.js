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
      this.updateSubTotal();
    },
    decQ() {
      if (this.quantity >= 1) {
        this.quantity--;
        this.updateSubTotal();
      }
    },
    updateSubTotal() {
      this.subTotal = this.unitPrice * this.quantity;
      this.$emit("updatePrice", this.subTotal);
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
        name: "Architect",
        price: 1600,
        picture: "https://placeimg.com/80/80/any"
      },
      {
        id: 2,
        name: "spotlight",
        price: 1700,
        picture: "https://placeimg.com/80/80/any"
      },
      {
        id: 3,
        name: "landscape",
        price: 150,
        picture: "https://placeimg.com/80/80/any"
      }
    ]
  },
  methods: {
    onClickChild(value) {
      console.log(value);
    }
  }
});
