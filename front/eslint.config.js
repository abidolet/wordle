import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		rules:
		{
			"indent": ["error", "tab", { "SwitchCase": 1 }],
			"no-mixed-spaces-and-tabs": "error",
			"max-len": ["warn", {
				"code": 80,
				"ignoreComments": true,
				"ignoreStrings": true
			}],
			"semi": ["error", "always"],
			"semi-spacing": ["error", { "before": false, "after": true }],
			"brace-style": ["error", "allman", { "allowSingleLine": false }],
			"curly": ["error", "all"],
			"space-infix-ops": "error",
			"keyword-spacing": ["error", { "before": true, "after": true }],
			"space-before-blocks": ["error", "always"],
			"space-before-function-paren": ["error", {
				"anonymous": "always",
				"named": "never",
				"asyncArrow": "always"
			}],
			"space-in-parens": ["error", "never"],
			"array-bracket-spacing": ["error", "never"],
			"object-curly-spacing": ["error", "always"],
			"no-multiple-empty-lines": ["error", {
				"max": 1,
				"maxEOF": 0,
				"maxBOF": 0
			}],
			"padded-blocks": ["error", "never"],
			"spaced-comment": ["error", "always", { "markers": ["/"] }],
			"no-unused-vars": ["warn", { "args": "none" }],
			"key-spacing": ["error", { "beforeColon": false, "afterColon": true }],
			"operator-linebreak": ["error", "after"],
			"function-call-argument-newline": ["error", "consistent"],
		}
	}
);
