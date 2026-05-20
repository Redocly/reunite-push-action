"use strict";
exports.id = 635;
exports.ids = [635];
exports.modules = {

/***/ 1635:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "handlePush": () => (/* binding */ handlePush)
/* harmony export */ });
/* harmony import */ var _redocly_openapi_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1234);
/* harmony import */ var colorette__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8559);
/* harmony import */ var node_fs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7561);
/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(9411);
/* harmony import */ var _utils_error_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(4259);
/* harmony import */ var _utils_miscellaneous_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(4707);
/* harmony import */ var _utils_package_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(3466);
/* harmony import */ var _api_index_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(833);
/* harmony import */ var _push_status_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(2719);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(2378);










async function handlePush({ argv, config, }) {
    const startedAt = performance.now(); // for printing execution time
    const startTime = Date.now(); // for push-status command
    const { organization, project: projectId, 'mount-path': mountPath, verbose } = argv;
    const domain = argv.domain || (0,_api_index_js__WEBPACK_IMPORTED_MODULE_7__/* .getDomain */ .ge)();
    if (!domain) {
        return (0,_utils_error_js__WEBPACK_IMPORTED_MODULE_4__/* .exitWithError */ .R)(`No domain provided, please use --domain option or environment variable REDOCLY_AUTHORIZATION.`);
    }
    try {
        const { 'commit-sha': commitSha, 'commit-url': commitUrl, 'default-branch': defaultBranch, 'wait-for-deployment': waitForDeployment, 'max-execution-time': maxExecutionTime, } = argv;
        const author = parseCommitAuthor(argv.author);
        const apiKey = (0,_api_index_js__WEBPACK_IMPORTED_MODULE_7__/* .getApiKeys */ .Bd)();
        const filesToUpload = collectFilesToPush(argv.files);
        const commandName = 'push';
        if (!filesToUpload.length) {
            return (0,_utils_miscellaneous_js__WEBPACK_IMPORTED_MODULE_5__/* .printExecutionTime */ .NH)(commandName, startedAt, `No files to upload`);
        }
        const client = new _api_index_js__WEBPACK_IMPORTED_MODULE_7__/* .ReuniteApi */ .Ur({ domain, apiKey, command: commandName });
        const projectDefaultBranch = await client.remotes.getDefaultBranch(organization, projectId);
        const remote = await client.remotes.upsert(organization, projectId, {
            mountBranchName: projectDefaultBranch,
            mountPath,
        });
        _redocly_openapi_core__WEBPACK_IMPORTED_MODULE_0__.logger.info(`Uploading to ${remote.mountPath} ${filesToUpload.length} ${(0,_redocly_openapi_core__WEBPACK_IMPORTED_MODULE_0__.pluralize)('file', filesToUpload.length)}:\n`);
        const { id } = await client.remotes.push(organization, projectId, {
            remoteId: remote.id,
            commit: {
                message: argv.message,
                branchName: argv.branch,
                sha: commitSha,
                url: commitUrl,
                createdAt: argv['created-at'],
                namespace: argv.namespace,
                repository: argv.repository,
                author,
            },
            isMainBranch: defaultBranch === argv.branch,
        }, filesToUpload.map((f) => ({ path: (0,_redocly_openapi_core__WEBPACK_IMPORTED_MODULE_0__.slash)(f.name), stream: node_fs__WEBPACK_IMPORTED_MODULE_2__.createReadStream(f.path) })));
        filesToUpload.forEach((f) => {
            _redocly_openapi_core__WEBPACK_IMPORTED_MODULE_0__.logger.info((0,colorette__WEBPACK_IMPORTED_MODULE_1__.green)(`✓ ${f.name}\n`));
        });
        _redocly_openapi_core__WEBPACK_IMPORTED_MODULE_0__.logger.info('\n');
        _redocly_openapi_core__WEBPACK_IMPORTED_MODULE_0__.logger.info(`Push ID: ${id}\n`);
        if (waitForDeployment) {
            _redocly_openapi_core__WEBPACK_IMPORTED_MODULE_0__.logger.info('\n');
            await (0,_push_status_js__WEBPACK_IMPORTED_MODULE_8__.handlePushStatus)({
                argv: {
                    organization,
                    project: projectId,
                    pushId: id,
                    wait: true,
                    domain,
                    'max-execution-time': maxExecutionTime,
                    'start-time': startTime,
                    'continue-on-deploy-failures': argv['continue-on-deploy-failures'],
                },
                config,
                version: _utils_package_js__WEBPACK_IMPORTED_MODULE_6__/* .version */ .i8,
            });
        }
        if (verbose) {
            (0,_utils_miscellaneous_js__WEBPACK_IMPORTED_MODULE_5__/* .printExecutionTime */ .NH)(commandName, startedAt, `${(0,_redocly_openapi_core__WEBPACK_IMPORTED_MODULE_0__.pluralize)('file', filesToUpload.length)} uploaded to organization ${organization}, project ${projectId}. Push ID: ${id}.`);
        }
        client.reportSunsetWarnings();
        return {
            pushId: id,
        };
    }
    catch (err) {
        (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__/* .handleReuniteError */ .K)('✗ File upload failed.', err);
    }
}
function parseCommitAuthor(author) {
    // Author Name <author@email.com>
    const reg = /^.+\s<[^<>]+>$/;
    if (!reg.test(author)) {
        throw new Error('Invalid author format. Use "Author Name <author@email.com>"');
    }
    const [name, email] = author.split('<');
    return {
        name: name.trim(),
        email: email.replace('>', '').trim(),
    };
}
function collectFilesToPush(files) {
    const collectedFiles = {};
    for (const file of files) {
        if (node_fs__WEBPACK_IMPORTED_MODULE_2__.statSync(file).isDirectory()) {
            const dir = file;
            const fileList = getFilesList(dir, []);
            fileList.forEach((f) => addFile(f, dir));
        }
        else {
            addFile(file, node_path__WEBPACK_IMPORTED_MODULE_3__.dirname(file));
        }
    }
    function addFile(filePath, fileDir) {
        const fileName = node_path__WEBPACK_IMPORTED_MODULE_3__.relative(fileDir, filePath);
        if (collectedFiles[fileName]) {
            _redocly_openapi_core__WEBPACK_IMPORTED_MODULE_0__.logger.warn(`File ${collectedFiles[fileName]} is overwritten by ${filePath}\n`);
        }
        collectedFiles[fileName] = filePath;
    }
    return Object.entries(collectedFiles).map(([name, filePath]) => getFileEntry(name, filePath));
}
function getFileEntry(name, filePath) {
    return {
        name,
        path: node_path__WEBPACK_IMPORTED_MODULE_3__.resolve(filePath),
    };
}
function getFilesList(dir, files) {
    const filesAndDirs = node_fs__WEBPACK_IMPORTED_MODULE_2__.readdirSync(dir);
    for (const name of filesAndDirs) {
        const currentPath = node_path__WEBPACK_IMPORTED_MODULE_3__.join(dir, name);
        if (node_fs__WEBPACK_IMPORTED_MODULE_2__.statSync(currentPath).isDirectory()) {
            files = getFilesList(currentPath, files);
        }
        else {
            files.push(currentPath);
        }
    }
    return files;
}
//# sourceMappingURL=push.js.map

/***/ })

};
;
//# sourceMappingURL=635.index.js.map