if [ ! -f node.js ]; then
    ln -s "./dist/node.js" node.js
fi

if [ ! -f node.d.ts ]; then
    ln -s "./dist/index.node.d.ts" node.d.ts
fi

if [ ! -f web.js ]; then
    ln -s "./dist/web.js" web.js
fi

if [ ! -f web.d.ts ]; then
    ln -s "./dist/index.web.d.ts" web.d.ts
fi
