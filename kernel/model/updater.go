// SiYuan - From thought to insight, with agents
// Copyright (c) 2020-present, b3log.org
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

package model

import (
	"context"
	"crypto/sha256"
	"errors"
	"fmt"
	"io"
	"os"
	"path"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/88250/gulu"
	"github.com/imroc/req/v3"
	"github.com/siyuan-note/logging"
	"github.com/siyuan-note/siyuan/kernel/util"
	"golang.org/x/mod/semver"
)

func getNewVerInstallPkgPath() string {
	if skipNewVerInstallPkg() {
		return ""
	}

	downloadPkgURLs, checksum, err := getUpdatePkg()
	if err != nil {
		return ""
	}

	pkg := path.Base(downloadPkgURLs[0])
	pkgPath := filepath.Join(util.TempDir, "install", pkg)
	localChecksum, _ := sha256Hash(pkgPath)
	if checksum != localChecksum {
		return ""
	}
	return pkgPath
}

var checkDownloadInstallPkgLock = sync.Mutex{}
var errUpdatePackageUnavailable = errors.New("update package is unavailable")

func checkDownloadInstallPkg(notifyPackageUnavailable bool) {
	defer logging.Recover()

	// 产品定制：固定当前版本，禁用新版本安装包的自动检查与下载
	return
}

func getUpdatePkg() (downloadPkgURLs []string, checksum string, err error) {
	release, err := getUpdateRelease(false)
	if err != nil {
		return
	}

	if isVersionUpToDate(release.Version) {
		err = fmt.Errorf("version is up to date")
		return
	}

	pkgName := currentInstallPackageName(release.Version)
	if "" == pkgName {
		err = fmt.Errorf("%w for the current platform", errUpdatePackageUnavailable)
		return
	}
	pkg := release.Packages[pkgName]
	if nil == pkg || 0 == len(pkg.URLs) {
		err = fmt.Errorf("%w: [%s]", errUpdatePackageUnavailable, pkgName)
		return
	}
	if "" == pkg.Checksum {
		err = fmt.Errorf("%w: [%s] checksum is unavailable", errUpdatePackageUnavailable, pkgName)
		return
	}
	downloadPkgURLs = append(downloadPkgURLs, pkg.URLs...)
	checksum = pkg.Checksum
	return
}

func downloadInstallPkg(pkgURL, checksum string) (err error) {
	if "" == pkgURL || "" == checksum {
		err = errors.New("update package URL or checksum is empty")
		return
	}

	pkg := path.Base(pkgURL)
	savePath := filepath.Join(util.TempDir, "install", pkg)
	if gulu.File.IsExist(savePath) {
		localChecksum, _ := sha256Hash(savePath)
		if localChecksum == checksum {
			return
		}
	}

	err = os.MkdirAll(filepath.Join(util.TempDir, "install"), 0755)
	if err != nil {
		logging.LogErrorf("create temp install dir failed: %s", err)
		return
	}

	logging.LogInfof("downloading install package [%s]", pkgURL)
	client := req.C().SetTLSHandshakeTimeout(7 * time.Second).SetTimeout(10 * time.Minute).DisableInsecureSkipVerify().SetUserAgent(util.UserAgent)
	callback := func(info req.DownloadInfo) {
		progress := fmt.Sprintf("%.2f%%", float64(info.DownloadedSize)/float64(info.Response.ContentLength)*100.0)
		// logging.LogDebugf("downloading install package [%s %s]", pkgURL, progress)
		util.PushStatusBar(fmt.Sprintf(Conf.Language(133), progress))
	}
	_, err = client.R().SetOutputFile(savePath).SetDownloadCallbackWithInterval(callback, 1*time.Second).Get(pkgURL)
	if err != nil {
		logging.LogErrorf("download install package [%s] failed: %s", pkgURL, err)
		if removeErr := os.Remove(savePath); nil != removeErr && !os.IsNotExist(removeErr) {
			logging.LogErrorf("remove incomplete install package [%s] failed: %s", savePath, removeErr)
		}
		return
	}

	localChecksum, _ := sha256Hash(savePath)
	if checksum != localChecksum {
		err = fmt.Errorf("verify checksum failed, download install package [%s] checksum [%s] not equal to downloaded [%s] checksum [%s]", pkgURL, checksum, savePath, localChecksum)
		logging.LogError(err.Error())
		if removeErr := os.Remove(savePath); nil != removeErr && !os.IsNotExist(removeErr) {
			logging.LogErrorf("remove invalid install package [%s] failed: %s", savePath, removeErr)
		}
		return
	}
	logging.LogInfof("downloaded install package [%s] to [%s]", pkgURL, savePath)
	util.PushStatusBar(Conf.Language(62))
	return
}

func sha256Hash(filename string) (ret string, err error) {
	file, err := os.Open(filename)
	if err != nil {
		return
	}
	defer file.Close()

	hash := sha256.New()
	if _, err = io.Copy(hash, file); err != nil {
		return "", err
	}
	return fmt.Sprintf("%x", hash.Sum(nil)), nil
}

type Announcement struct {
	Id     string `json:"id"`
	Title  string `json:"title"`
	URL    string `json:"url"`
	Region int    `json:"region"`
}

func getAnnouncements() (ret []*Announcement) {
	result, err := util.GetRhyResult(context.TODO(), false)
	if err != nil {
		logging.LogErrorf("get announcement failed: %s", err)
		return
	}

	if nil == result["announcement"] {
		return
	}

	announcements := result["announcement"].([]any)
	for _, announcement := range announcements {
		ann := announcement.(map[string]any)
		ret = append(ret, &Announcement{
			Id:     ann["id"].(string),
			Title:  ann["title"].(string),
			URL:    ann["url"].(string),
			Region: int(ann["region"].(float64)),
		})
	}
	return
}

func CheckUpdate(showMsg bool) {
	// 产品定制：固定当前版本，禁用自动检查更新与升级提醒（同时使定时任务与帮助文档触发路径失效）
	return
}

func pushNewVersionNotification(release *updateRelease) {
	releaseLink := "<a href=\"" + release.ReleaseURL + "\">" + release.ReleaseURL + "</a>"
	util.PushUpdateMsg("update-notify", fmt.Sprintf(Conf.Language(9), releaseLink), 15000)
}

func isVersionUpToDate(releaseVer string) bool {
	return semver.Compare("v"+releaseVer, "v"+util.Ver) <= 0
}

// skipInstallPkgPlatformCached 缓存平台相关判断，-1 未初始化，0 表示不跳过，1 表示跳过
var skipInstallPkgPlatformCached = -1

func skipNewVerInstallPkg() bool {
	if skipInstallPkgPlatformCached == -1 {
		skipInstallPkgPlatformCached = 0
		if !gulu.OS.IsWindows() && !gulu.OS.IsDarwin() {
			skipInstallPkgPlatformCached = 1
		} else if util.ISMicrosoftStore || util.ContainerStd != util.Container {
			skipInstallPkgPlatformCached = 1
		} else if gulu.OS.IsWindows() {
			plat := strings.ToLower(Conf.System.OSPlatform)
			// Windows 7, 8 and Server 2012 are no longer supported https://github.com/siyuan-note/siyuan/issues/7347
			if strings.Contains(plat, " 7 ") || strings.Contains(plat, " 8 ") || strings.Contains(plat, "2012") {
				skipInstallPkgPlatformCached = 1
			}
		}
	}

	if skipInstallPkgPlatformCached == 1 || !Conf.System.DownloadInstallPkg {
		return true
	}
	return false
}
