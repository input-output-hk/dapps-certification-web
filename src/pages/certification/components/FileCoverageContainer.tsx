import React from "react";
import parse from 'html-react-parser';
import ProgressCard from "components/ProgressCard/ProgressCard";

const FileCoverageContainer: React.FC<{
    result: { [x: string]: any };
    githubLink: string;
    coverageFile?: string
}> = ({ result, githubLink, coverageFile = '' }) => {
    const parseHTMLContents = (filename: string) => {
        const pattern = new RegExp("<h2(.*)>"+filename+"</h2>")
        const pre = coverageFile.split(pattern)
        const content = pre[2].split('</pre>')[0] + '</pre>'
        return parse(content);
    }

    const coverageIndexFiles: Array<string> = [];
    const coverageIndexReport: any = {};
    if (result._certRes_coverageReport?._coverageIndex?._coverageMetadata) {
        result._certRes_coverageReport?._coverageIndex?._coverageMetadata.forEach(
            (item: any) => {
                // Find out all files upon which coverage is handled
                const parentLoc =
                    item[0]["tag"] === "CoverLocation"
                        ? item[0]["contents"]
                        : item[0]["contents"][0];
                const covFile: string = parentLoc["_covLocFile"];
                if (covFile && coverageIndexFiles.indexOf(covFile) === -1) {
                    coverageIndexFiles.push(covFile);
                    !coverageIndexReport.hasOwnProperty(covFile) &&
                        (coverageIndexReport[covFile] = []);
                }
                coverageIndexReport.hasOwnProperty(covFile) &&
                    coverageIndexReport[covFile].push(item[0]);
            }
        );
    }

    const coverageFiles: Array<string> = [];
    const coverageReport: any = {};
    if (result._certRes_coverageReport?._coverageData?._coveredAnnotations) {
        result._certRes_coverageReport?._coverageData?._coveredAnnotations.forEach(
            (item: any) => {
                const parentLoc =
                    item["tag"] === "CoverLocation"
                        ? item["contents"]
                        : item["contents"][0];
                const covFile: string = parentLoc["_covLocFile"];
                if (covFile && coverageFiles.indexOf(covFile) === -1) {
                    coverageFiles.push(covFile);
                    !coverageReport.hasOwnProperty(covFile) &&
                        (coverageReport[covFile] = []);
                }
                coverageReport.hasOwnProperty(covFile) &&
                    coverageReport[covFile].push(item[0]);
            }
        );
    }
    
    const percentagePerFile: {[x: string]: string} = {};
    coverageIndexFiles.forEach(filename => {
        if (coverageReport[filename] && coverageIndexReport[filename]) {
            percentagePerFile[filename] = ((coverageReport[filename].length / coverageIndexReport[filename].length) * 100).toFixed(2)
        }
    })

    const renderRows = () => {
        return coverageIndexFiles ? coverageIndexFiles.map((file: string, index) => {
            //         {/* To be changed to location of the file code coverage UI */}
            //         <span className="link" data-testid="file-link" onClick={(_) => onOpenModal(file)}>{file}</span>
            //         <Modal id="coverageHtmlModal" open={isOpen===file} onCloseModal={onCloseModal}>
            //             <div>{parseHTMLContents(file)}</div>
            //         </Modal>
            return coverageReport[file] && coverageIndexReport[file] ? 
                <ProgressCard 
                    key={index}
                    title={"Code Coverage"}
                    displayText={file}
                    currentValue={coverageReport[file].length}
                    totalValue={coverageIndexReport[file].length}
                    // tooltipText={"Code coverage is a measure of how much of your on-chain code has been executed during testing"}
                />
                : null;
        }) : null;
    };

    return (<>
        {coverageIndexFiles ? (
            <div id="coverageIndicator">
                {renderRows()}
            </div>
        ) : null}
    </>);
};

export default FileCoverageContainer;
