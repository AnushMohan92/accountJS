function showHideLegalHoldProperty(executionContext) {
	var formContext = executionContext.getFormContext();
	var roles = Xrm.Utility.getGlobalContext().userSettings.roles;

	if (roles === null) return false;

	roles.forEach(function (item) {
		if (item.name.toLowerCase() === "ceo-business manager") {
			formContext.getControl("tfl_legalholdproperty").setVisible(true);
		}
		else {
			formContext.getControl("tfl_legalholdproperty").setVisible(false);
		}
	});
}

function PromptReasonForHold(executionContext) {
	var formContext = executionContext.getFormContext();
	var formType = formContext.ui.getFormType();
	var accountId = formContext.data.entity.getId().replace("{", "").replace("}", "");
	var currentValue = formContext.getAttribute("tfl_legalholdproperty").getValue();
	var reasonForHoldText;
	if (currentValue) {
		formContext.ui.setFormNotification("You are about to apply legal hold on the property!", "WARNING", 1);

			 reasonForHoldText = prompt("Please enter the reason for Hold");

		if (reasonForHoldText === null || reasonForHoldText === "") {
			formContext.getAttribute("tfl_legalholdproperty").setValue(false);
			if (formType === 2) {
				formContext.data.entity.save();
				formContext.getAttribute("tfl_legalholdproperty").setSubmitMode("always");
			}
			formContext.ui.clearFormNotification(1);
		}
		else {
			var entity = {};
			entity.subject = "Property On Hold Reason";
			entity.notetext = reasonForHoldText;
			entity["objectid_account@odata.bind"] = "/accounts(" + accountId + ")";
			Xrm.WebApi.online.createRecord("annotation", entity).then(
				function success(result) {
					var newEntityId = result.id;
				},
				function (error) {
					Xrm.Utility.alertDialog(error.message);
				}
			);
			formContext.ui.clearFormNotification(1);
		}
	}
}
