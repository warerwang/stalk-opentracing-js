if [ ! -L node.js ]; then
    ln -s "./dist/node.js" node.js
fi

if [ ! -L node.d.ts ]; then
    ln -s "./dist/index.d.ts" node.d.ts
fi

if [ ! -L web.js ]; then
    ln -s "./dist/web.js" web.js
fi

if [ ! -L web.d.ts ]; then
    ln -s "./dist/index.d.ts" web.d.ts
fi
