import { ObjectsRegistry } from "../../../../support/Objects/Registry"

let dsl: any;
let agHelper = ObjectsRegistry.AggregateHelper,
  homePage = ObjectsRegistry.HomePage,
  ee = ObjectsRegistry.EntityExplorer,
  apiPage = ObjectsRegistry.ApiPage,
  jsEditor = ObjectsRegistry.JSEditor,
  locator = ObjectsRegistry.CommonLocators;

describe("Layout OnLoad Actions tests", function () {
  before(() => {
    cy.fixture("onPageLoadActionsDsl").then((val: any) => {
      dsl = val;
    });
  });

  it("1. Bug 8595: OnPageLoad execution - when No api to run on Pageload", function () {
    agHelper.AddDsl(dsl);
    ee.SelectEntityByName("WIDGETS");
    ee.SelectEntityByName("Page1");
    cy.url().then((url) => {
      const pageid = url.split("/")[4]?.split("-").pop();
      cy.log(pageid + "page id");
      cy.request("GET", "api/v1/pages/" + pageid).then((response) => {
        const respBody = JSON.stringify(response.body);
        const _emptyResp = JSON.parse(respBody).data.layouts[0]
          .layoutOnLoadActions;
        expect(JSON.parse(JSON.stringify(_emptyResp))).to.deep.eq([]);
      });
    });
  });

  it("2. Bug 8595: OnPageLoad execution - when Query Parmas added via Params tab", function () {
    agHelper.AddDsl(dsl, locator._imageWidget);
    apiPage.CreateAndFillApi(
      "https://source.unsplash.com/collection/1599413",
      "RandomFlora",
    );
    //apiPage.RunAPI();

    apiPage.CreateAndFillApi("https://randomuser.me/api/", "RandomUser");
    //apiPage.RunAPI();

    apiPage.CreateAndFillApi("https://favqs.com/api/qotd", "InspiringQuotes");
    apiPage.EnterHeader("dependency", "{{RandomUser.data}}");//via Params tab
    //apiPage.RunAPI();

    apiPage.CreateAndFillApi(
      "https://www.boredapi.com/api/activity",
      "Suggestions",
    );
    apiPage.EnterHeader("dependency", "{{InspiringQuotes.data}}");
    //apiPage.RunAPI();

    apiPage.CreateAndFillApi("https://api.genderize.io", "Genderize");
    apiPage.EnterParams("name", "{{RandomUser.data.results[0].name.first}}");//via Params tab
    //apiPage.RunAPI();

    //Adding dependency in right order matters!
    ee.SelectEntityByName("WIDGETS");
    ee.SelectEntityByName("Image1");
    jsEditor.EnterJSContext("image", `{{RandomFlora.data}}`, true);

    ee.SelectEntityByName("Image2");
    jsEditor.EnterJSContext("image", `{{RandomUser.data.results[0].picture.large}}`, true);

    ee.SelectEntityByName("Text1");
    jsEditor.EnterJSContext("text", `{{InspiringQuotes.data.quote.body}}\n--\n{{InspiringQuotes.data.quote.author}}\n`, true);

    ee.SelectEntityByName("Text2");
    jsEditor.EnterJSContext("text", `Hi, here is {{RandomUser.data.results[0].name.first}} & I'm {{RandomUser.data.results[0].dob.age}}'yo\nI live in {{RandomUser.data.results[0].location.country}}\nMy Suggestion : {{Suggestions.data.activity}}\n\nI'm {{Genderize.data.gender}}`, true);

    // cy.url().then((url) => {
    //   const pageid = url.split("/")[4]?.split("-").pop();
    //   cy.log(pageid + "page id");
    //   cy.request("GET", "api/v1/pages/" + pageid).then((response) => {
    //     const respBody = JSON.stringify(response.body);

    //     const _randomFlora = JSON.parse(respBody).data.layouts[0]
    //       .layoutOnLoadActions[0];
    //     const _randomUser = JSON.parse(respBody).data.layouts[0]
    //       .layoutOnLoadActions[1];
    //     const _genderize = JSON.parse(respBody).data.layouts[0]
    //       .layoutOnLoadActions[2];
    //     const _suggestions = JSON.parse(respBody).data.layouts[0]
    //       .layoutOnLoadActions[3];
    //     // cy.log("_randomFlora is: " + JSON.stringify(_randomFlora))
    //     // cy.log("_randomUser is: " + JSON.stringify(_randomUser))
    //     // cy.log("_genderize is: " + JSON.stringify(_genderize))
    //     // cy.log("_suggestions is: " + JSON.stringify(_suggestions))

    //     expect(JSON.parse(JSON.stringify(_randomFlora))[0]["name"]).to.eq(
    //       "RandomFlora",
    //     );
    //     expect(JSON.parse(JSON.stringify(_randomUser))[0]["name"]).to.eq(
    //       "RandomUser",
    //     );
    //     expect(JSON.parse(JSON.stringify(_genderize))[0]["name"]).to.be.oneOf([
    //       "Genderize",
    //       "InspiringQuotes",
    //     ]);
    //     expect(JSON.parse(JSON.stringify(_genderize))[1]["name"]).to.be.oneOf([
    //       "Genderize",
    //       "InspiringQuotes",
    //     ]);
    //     expect(JSON.parse(JSON.stringify(_suggestions))[0]["name"]).to.eq(
    //       "Suggestions",
    //     );
    //   });
    // });

    agHelper.DeployApp()
    agHelper.Sleep()//waiting for error toast - incase it wants to appear!
    agHelper.AssertElementAbsence(locator._toastMsg)
    agHelper.Sleep(5000)//for all api's to ccomplete call!
    cy.wait("@viewPage").then(($response) => {
      const respBody = JSON.stringify($response.response?.body);

      const _randomFlora = JSON.parse(respBody).data.layouts[0]
        .layoutOnLoadActions[0];
      const _randomUser = JSON.parse(respBody).data.layouts[0]
        .layoutOnLoadActions[1];
      const _genderize = JSON.parse(respBody).data.layouts[0]
        .layoutOnLoadActions[2];
      const _suggestions = JSON.parse(respBody).data.layouts[0]
        .layoutOnLoadActions[3];
      // cy.log("_randomFlora is: " + JSON.stringify(_randomFlora))
      // cy.log("_randomUser is: " + JSON.stringify(_randomUser))
      // cy.log("_genderize is: " + JSON.stringify(_genderize))
      // cy.log("_suggestions is: " + JSON.stringify(_suggestions))

      expect(JSON.parse(JSON.stringify(_randomFlora))[0]["name"]).to.eq(
        "RandomFlora",
      );
      expect(JSON.parse(JSON.stringify(_randomUser))[0]["name"]).to.eq(
        "RandomUser",
      );
      expect(JSON.parse(JSON.stringify(_genderize))[0]["name"]).to.be.oneOf([
        "Genderize",
        "InspiringQuotes",
      ]);
      expect(JSON.parse(JSON.stringify(_genderize))[1]["name"]).to.be.oneOf([
        "Genderize",
        "InspiringQuotes",
      ]);
      expect(JSON.parse(JSON.stringify(_suggestions))[0]["name"]).to.eq(
        "Suggestions",
      );
    })

    agHelper.NavigateBacktoEditor()
  });

  it("3. Bug 10049, 10055: Dependency not executed in expected order in layoutOnLoadActions when dependency added via URL", function () {
    ee.SelectEntityByName('Genderize', 'QUERIES/JS')
    ee.ActionContextMenuByEntityName('Genderize', 'Delete', 'Are you sure?')

    apiPage.CreateAndFillApi(
      "https://api.genderize.io?name={{RandomUser.data.results[0].name.first}}",
      "Genderize",
    );
    apiPage.ValidateQueryParams({
      key: "name",
      value: "{{RandomUser.data.results[0].name.first}}",
    }); // verifies Bug 10055
    
    agHelper.DeployApp()
    agHelper.Sleep()//waiting for error toast - incase it wants to appear!
    agHelper.AssertElementAbsence(locator._toastMsg)
    agHelper.Sleep(5000)//for all api's to ccomplete call!
    cy.wait("@viewPage").then(($response) => {
      const respBody = JSON.stringify($response.response?.body);
      const _randomFlora = JSON.parse(respBody).data.layouts[0]
        .layoutOnLoadActions[0];
      const _randomUser = JSON.parse(respBody).data.layouts[0]
        .layoutOnLoadActions[1];
      const _genderize = JSON.parse(respBody).data.layouts[0]
        .layoutOnLoadActions[2];
      const _suggestions = JSON.parse(respBody).data.layouts[0]
        .layoutOnLoadActions[3];

      expect(JSON.parse(JSON.stringify(_randomFlora))[0]["name"]).to.eq(
        "RandomFlora",
      );
      expect(JSON.parse(JSON.stringify(_randomUser))[0]["name"]).to.eq(
        "RandomUser",
      );
      expect(JSON.parse(JSON.stringify(_genderize))[0]["name"]).to.be.oneOf([
        "Genderize",
        "InspiringQuotes",
      ]);
      expect(JSON.parse(JSON.stringify(_genderize))[1]["name"]).to.be.oneOf([
        "Genderize",
        "InspiringQuotes",
      ]);
      expect(JSON.parse(JSON.stringify(_suggestions))[0]["name"]).to.eq(
        "Suggestions",
      );
    })
  });
});
