{ system
  , compiler
  , flags
  , pkgs
  , hsPkgs
  , pkgconfPkgs
  , errorHandler
  , config
  , ... }:
  {
    flags = {};
    package = {
      specVersion = "2.2";
      identifier = { name = "servant-server"; version = "0.19"; };
      license = "BSD-3-Clause";
      copyright = "2014-2016 Zalora South East Asia Pte Ltd, 2016-2019 Servant Contributors";
      maintainer = "haskell-servant-maintainers@googlegroups.com";
      author = "Servant Contributors";
      homepage = "http://docs.servant.dev/";
      url = "";
      synopsis = "A family of combinators for defining webservices APIs and serving them";
      description = "A family of combinators for defining webservices APIs and serving them\n\nYou can learn about the basics in the <http://docs.servant.dev/en/stable/tutorial/index.html tutorial>.\n\n<https://github.com/haskell-servant/servant/blob/master/servant-server/example/greet.hs Here>\nis a runnable example, with comments, that defines a dummy API and implements\na webserver that serves this API, using this package.\n\n<https://github.com/haskell-servant/servant/blob/master/servant-server/CHANGELOG.md CHANGELOG>";
      buildType = "Simple";
      isLocal = true;
      detailLevel = "FullDetails";
      licenseFiles = [ "LICENSE" ];
      dataDir = ".";
      dataFiles = [];
      extraSrcFiles = [ "CHANGELOG.md" "README.md" ];
      extraTmpFiles = [];
      extraDocFiles = [];
      };
    components = {
      "library" = {
        depends = [
          (hsPkgs."base" or (errorHandler.buildDepError "base"))
          (hsPkgs."bytestring" or (errorHandler.buildDepError "bytestring"))
          (hsPkgs."constraints" or (errorHandler.buildDepError "constraints"))
          (hsPkgs."containers" or (errorHandler.buildDepError "containers"))
          (hsPkgs."mtl" or (errorHandler.buildDepError "mtl"))
          (hsPkgs."text" or (errorHandler.buildDepError "text"))
          (hsPkgs."transformers" or (errorHandler.buildDepError "transformers"))
          (hsPkgs."filepath" or (errorHandler.buildDepError "filepath"))
          (hsPkgs."servant" or (errorHandler.buildDepError "servant"))
          (hsPkgs."http-api-data" or (errorHandler.buildDepError "http-api-data"))
          (hsPkgs."base-compat" or (errorHandler.buildDepError "base-compat"))
          (hsPkgs."base64-bytestring" or (errorHandler.buildDepError "base64-bytestring"))
          (hsPkgs."exceptions" or (errorHandler.buildDepError "exceptions"))
          (hsPkgs."http-media" or (errorHandler.buildDepError "http-media"))
          (hsPkgs."http-types" or (errorHandler.buildDepError "http-types"))
          (hsPkgs."network-uri" or (errorHandler.buildDepError "network-uri"))
          (hsPkgs."monad-control" or (errorHandler.buildDepError "monad-control"))
          (hsPkgs."network" or (errorHandler.buildDepError "network"))
          (hsPkgs."sop-core" or (errorHandler.buildDepError "sop-core"))
          (hsPkgs."string-conversions" or (errorHandler.buildDepError "string-conversions"))
          (hsPkgs."resourcet" or (errorHandler.buildDepError "resourcet"))
          (hsPkgs."tagged" or (errorHandler.buildDepError "tagged"))
          (hsPkgs."transformers-base" or (errorHandler.buildDepError "transformers-base"))
          (hsPkgs."wai" or (errorHandler.buildDepError "wai"))
          (hsPkgs."wai-app-static" or (errorHandler.buildDepError "wai-app-static"))
          (hsPkgs."word8" or (errorHandler.buildDepError "word8"))
          ];
        buildable = true;
        modules = [
          "Servant"
          "Servant/Server"
          "Servant/Server/Experimental/Auth"
          "Servant/Server/Generic"
          "Servant/Server/Internal"
          "Servant/Server/Internal/BasicAuth"
          "Servant/Server/Internal/Context"
          "Servant/Server/Internal/Delayed"
          "Servant/Server/Internal/DelayedIO"
          "Servant/Server/Internal/ErrorFormatter"
          "Servant/Server/Internal/Handler"
          "Servant/Server/Internal/RouteResult"
          "Servant/Server/Internal/Router"
          "Servant/Server/Internal/RoutingApplication"
          "Servant/Server/Internal/ServerError"
          "Servant/Server/StaticFiles"
          "Servant/Server/UVerb"
          "Servant/Utils/StaticFiles"
          ];
        hsSourceDirs = [ "src" ];
        };
      exes = {
        "greet" = {
          depends = [
            (hsPkgs."base" or (errorHandler.buildDepError "base"))
            (hsPkgs."base-compat" or (errorHandler.buildDepError "base-compat"))
            (hsPkgs."servant" or (errorHandler.buildDepError "servant"))
            (hsPkgs."servant-server" or (errorHandler.buildDepError "servant-server"))
            (hsPkgs."wai" or (errorHandler.buildDepError "wai"))
            (hsPkgs."text" or (errorHandler.buildDepError "text"))
            (hsPkgs."aeson" or (errorHandler.buildDepError "aeson"))
            (hsPkgs."warp" or (errorHandler.buildDepError "warp"))
            ];
          buildable = true;
          hsSourceDirs = [ "example" ];
          mainPath = [ "greet.hs" ];
          };
        };
      tests = {
        "spec" = {
          depends = [
            (hsPkgs."base" or (errorHandler.buildDepError "base"))
            (hsPkgs."base-compat" or (errorHandler.buildDepError "base-compat"))
            (hsPkgs."base64-bytestring" or (errorHandler.buildDepError "base64-bytestring"))
            (hsPkgs."bytestring" or (errorHandler.buildDepError "bytestring"))
            (hsPkgs."http-types" or (errorHandler.buildDepError "http-types"))
            (hsPkgs."mtl" or (errorHandler.buildDepError "mtl"))
            (hsPkgs."resourcet" or (errorHandler.buildDepError "resourcet"))
            (hsPkgs."safe" or (errorHandler.buildDepError "safe"))
            (hsPkgs."servant" or (errorHandler.buildDepError "servant"))
            (hsPkgs."servant-server" or (errorHandler.buildDepError "servant-server"))
            (hsPkgs."sop-core" or (errorHandler.buildDepError "sop-core"))
            (hsPkgs."string-conversions" or (errorHandler.buildDepError "string-conversions"))
            (hsPkgs."text" or (errorHandler.buildDepError "text"))
            (hsPkgs."transformers" or (errorHandler.buildDepError "transformers"))
            (hsPkgs."transformers-compat" or (errorHandler.buildDepError "transformers-compat"))
            (hsPkgs."wai" or (errorHandler.buildDepError "wai"))
            (hsPkgs."aeson" or (errorHandler.buildDepError "aeson"))
            (hsPkgs."directory" or (errorHandler.buildDepError "directory"))
            (hsPkgs."hspec" or (errorHandler.buildDepError "hspec"))
            (hsPkgs."hspec-wai" or (errorHandler.buildDepError "hspec-wai"))
            (hsPkgs."QuickCheck" or (errorHandler.buildDepError "QuickCheck"))
            (hsPkgs."should-not-typecheck" or (errorHandler.buildDepError "should-not-typecheck"))
            (hsPkgs."temporary" or (errorHandler.buildDepError "temporary"))
            (hsPkgs."wai-extra" or (errorHandler.buildDepError "wai-extra"))
            ];
          build-tools = [
            (hsPkgs.buildPackages.hspec-discover.components.exes.hspec-discover or (pkgs.buildPackages.hspec-discover or (errorHandler.buildToolDepError "hspec-discover:hspec-discover")))
            ];
          buildable = true;
          modules = [
            "Servant/ArbitraryMonadServerSpec"
            "Servant/Server/ErrorSpec"
            "Servant/Server/Internal/ContextSpec"
            "Servant/Server/Internal/RoutingApplicationSpec"
            "Servant/Server/RouterSpec"
            "Servant/Server/StaticFilesSpec"
            "Servant/Server/StreamingSpec"
            "Servant/Server/UsingContextSpec"
            "Servant/Server/UsingContextSpec/TestCombinators"
            "Servant/HoistSpec"
            "Servant/ServerSpec"
            ];
          hsSourceDirs = [ "test" ];
          mainPath = [ "Spec.hs" ];
          };
        };
      };
    } // {
    src = (pkgs.lib).mkDefault (pkgs.fetchgit {
      url = "3";
      rev = "minimal";
      sha256 = "";
      }) // {
      url = "3";
      rev = "minimal";
      sha256 = "";
      };
    postUnpack = "sourceRoot+=/servant-server; echo source root reset to \$sourceRoot";
    }