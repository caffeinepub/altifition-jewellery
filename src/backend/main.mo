import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Types
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    imageUrl : Text;
    category : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  // State
  let products = Map.empty<Nat, Product>();
  var nextProductId = 1;
  let accessControlState = AccessControl.initState();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Mixin storage
  include MixinStorage();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Initialize with sample products
  public shared ({ caller }) func initialize() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let sampleProducts = [
      {
        id = 1;
        name = "Diamond Ring";
        description = "Elegant diamond ring with 18k gold band";
        imageUrl = "";
        category = "Rings";
      },
      {
        id = 2;
        name = "Pearl Necklace";
        description = "Classic pearl necklace with silver clasp";
        imageUrl = "";
        category = "Necklaces";
      },
      {
        id = 3;
        name = "Gold Earrings";
        description = "Stylish gold hoop earrings";
        imageUrl = "";
        category = "Earrings";
      },
      {
        id = 4;
        name = "Sapphire Ring";
        description = "Beautiful sapphire gemstone ring";
        imageUrl = "";
        category = "Rings";
      },
      {
        id = 5;
        name = "Diamond Necklace";
        description = "Diamond-encrusted white gold necklace";
        imageUrl = "";
        category = "Necklaces";
      },
      {
        id = 6;
        name = "Emerald Earrings";
        description = "Emerald stud earrings with platinum setting";
        imageUrl = "";
        category = "Earrings";
      },
    ];
    for (product in sampleProducts.values()) {
      products.add(product.id, product);
    };
    nextProductId := 7;
  };

  // Public functions
  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray();
  };

  func isValidCategory(category : Text) : Bool {
    category == "Rings" or category == "Necklaces" or category == "Earrings";
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    if (not isValidCategory(category)) {
      Runtime.trap("Category does not exist");
    };
    products.values().toArray().filter(func(p) { p.category == category });
  };

  // Admin-only functions
  public shared ({ caller }) func addProduct(name : Text, description : Text, imageUrl : Text, category : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (not isValidCategory(category)) {
      Runtime.trap("Category does not exist");
    };

    let product : Product = {
      id = nextProductId;
      name;
      description;
      imageUrl;
      category;
    };

    products.add(nextProductId, product);
    nextProductId += 1;
    product.id;
  };

  public shared ({ caller }) func updateProduct(id : Nat, name : Text, description : Text, imageUrl : Text, category : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (not isValidCategory(category)) {
      Runtime.trap("Category does not exist");
    };

    switch (products.get(id)) {
      case (null) {
        Runtime.trap("Product does not exist");
      };
      case (?existingProduct) {
        let updatedProduct : Product = {
          id = existingProduct.id;
          name;
          description;
          imageUrl;
          category;
        };
        products.add(id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (not products.containsKey(id)) {
      Runtime.trap("Product does not exist");
    };
    products.remove(id);
  };
};
