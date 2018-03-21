build-frontend:
	npm run build

publish:
	surge --project build --domain https://budgeto.surge.sh
